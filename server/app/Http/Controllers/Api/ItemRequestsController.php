<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ItemRequest;
use App\Models\InventoryItem;

class ItemRequestsController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = ItemRequest::orderByDesc('created_at')->get();
        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item_id' => 'nullable|integer',
            'item_name' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'teacher_id' => 'nullable|integer',
            'quantity_requested' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'subject' => 'nullable|string|max:500',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'request_type' => 'nullable|string|in:item,maintenance,custom,report',
            'description' => 'nullable|string',
            'photo' => 'nullable|string'
        ]);

        // Convert null item_id to null explicitly
        if (isset($data['item_id']) && $data['item_id'] === '') {
            $data['item_id'] = null;
        }

        // Handle custom requests (no item_id)
        if ($data['request_type'] === 'custom' || !$data['item_id']) {
            $data['status'] = 'pending';
            $data['quantity_assigned'] = 0;
            $data['item_id'] = null; // Custom requests don't have item_id

            $itemRequest = ItemRequest::create($data);
            return response()->json(['request' => $itemRequest], 201);
        }

        // Handle regular inventory requests - validate item_id exists
        if (!InventoryItem::where('id', $data['item_id'])->exists()) {
            return response()->json(['message' => 'Item not found in inventory'], 422);
        }

        $inventoryItem = InventoryItem::findOrFail($data['item_id']);
        if ($inventoryItem->available < $data['quantity_requested']) {
            return response()->json(['message' => 'Not enough available quantity'], 422);
        }

        // Immediately reserve by decreasing availability
        $inventoryItem->available -= $data['quantity_requested'];
        $inventoryItem->save();

        $data['status'] = 'pending';
        $data['quantity_assigned'] = 0;

        $itemRequest = ItemRequest::create($data);
        return response()->json(['request' => $itemRequest, 'item' => $inventoryItem], 201);
    }

    public function assign(Request $request, ItemRequest $itemRequest): JsonResponse
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
            'due_date' => 'nullable|date'
        ]);

        // Availability already reserved on create; do not decrease here
        $inventoryItem = InventoryItem::findOrFail($itemRequest->item_id);

        // Update request
        $itemRequest->quantity_assigned = max($itemRequest->quantity_assigned, (int)$data['quantity']);
        $itemRequest->due_date = $data['due_date'] ?? $itemRequest->due_date;
        $itemRequest->status = 'assigned';
        $itemRequest->save();

        return response()->json(['request' => $itemRequest, 'item' => $inventoryItem]);
    }

    public function markReturned(ItemRequest $itemRequest): JsonResponse
    {
        $inventoryItem = InventoryItem::findOrFail($itemRequest->item_id);
        // Increase availability back by assigned quantity
        $inventoryItem->available += $itemRequest->quantity_assigned;
        $inventoryItem->save();

        $itemRequest->status = 'returned';
        $itemRequest->returned_at = now();
        $itemRequest->save();

        return response()->json(['request' => $itemRequest, 'item' => $inventoryItem]);
    }

    public function approveAndAssign(Request $request, ItemRequest $itemRequest): JsonResponse
    {
        try {
            \Log::info('Approval request received', [
                'request_id' => $itemRequest->id,
                'request_data' => $request->all()
            ]);

            $data = $request->validate([
                'due_date' => 'required|date|after_or_equal:today',
                'quantity' => 'nullable|integer|min:1'
            ]);

            \Log::info('Validation passed', ['validated_data' => $data]);

            $inventoryItem = InventoryItem::findOrFail($itemRequest->item_id);

            // Set assigned quantity (default to requested if not provided)
            $assignedQuantity = $data['quantity'] ?? $itemRequest->quantity_requested;

            \Log::info('Assignment details', [
                'assigned_quantity' => $assignedQuantity,
                'due_date' => $data['due_date']
            ]);

            // Update request status and details
            $itemRequest->status = 'assigned';
            $itemRequest->quantity_assigned = $assignedQuantity;
            $itemRequest->due_date = $data['due_date'];
            $itemRequest->assigned_at = now();
            $itemRequest->save();

            \Log::info('Request updated successfully', ['request_id' => $itemRequest->id]);

            return response()->json(['request' => $itemRequest, 'item' => $inventoryItem]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in approveAndAssign', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error in approveAndAssign', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function updateReturnStatus(ItemRequest $itemRequest, Request $request): JsonResponse
    {
        $data = $request->validate([
            'return_status' => 'required|in:returned,not_returned,overdue'
        ]);

        $itemRequest->return_status = $data['return_status'];

        // If marking as returned, also update the main status and timestamp
        if ($data['return_status'] === 'returned') {
            $itemRequest->status = 'returned';
            $itemRequest->returned_at = now();

            // Restore availability
            $inventoryItem = InventoryItem::findOrFail($itemRequest->item_id);
            $inventoryItem->available += $itemRequest->quantity_assigned;
            $inventoryItem->save();
        }

        $itemRequest->save();
        return response()->json($itemRequest);
    }

    public function teacherReturnItem(ItemRequest $itemRequest): JsonResponse
    {
        try {
            // Check if item is assigned to the teacher
            if ($itemRequest->status !== 'assigned') {
                return response()->json(['message' => 'Item is not currently assigned'], 400);
            }

            // Update return status and main status
            $itemRequest->return_status = 'returned';
            $itemRequest->status = 'returned';
            $itemRequest->returned_at = now();
            $itemRequest->save();

            // Restore availability in inventory
            $inventoryItem = InventoryItem::findOrFail($itemRequest->item_id);
            $inventoryItem->available += $itemRequest->quantity_assigned;
            $inventoryItem->save();

            \Log::info('Teacher returned item', [
                'request_id' => $itemRequest->id,
                'teacher' => $itemRequest->teacher_name,
                'item' => $itemRequest->item_name,
                'quantity' => $itemRequest->quantity_assigned
            ]);

            return response()->json([
                'message' => 'Item returned successfully',
                'request' => $itemRequest,
                'item' => $inventoryItem
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in teacherReturnItem', [
                'message' => $e->getMessage(),
                'request_id' => $itemRequest->id
            ]);
            return response()->json(['message' => 'Error returning item: ' . $e->getMessage()], 500);
        }
    }

    public function getOverdueItems(): JsonResponse
    {
        $overdueItems = ItemRequest::where('status', 'assigned')
            ->where('due_date', '<', now())
            ->where('return_status', '!=', 'returned')
            ->get();

        return response()->json($overdueItems);
    }

    public function getTeacherAssignedItems(Request $request): JsonResponse
    {
        $teacherName = $request->query('teacher_name');

        if (!$teacherName) {
            return response()->json(['message' => 'Teacher name is required'], 400);
        }

        $assignedItems = ItemRequest::where('teacher_name', $teacherName)
            ->where('status', 'assigned')
            ->where(function($query) {
                $query->whereNull('return_status')
                      ->orWhere('return_status', '!=', 'returned');
            })
            ->select('item_id', 'item_name', 'quantity_assigned as assigned')
            ->get()
            ->groupBy('item_id')
            ->map(function ($group) {
                $first = $group->first();
                return [
                    'id' => (string)$first->item_id,
                    'name' => $first->item_name,
                    'assigned' => $group->sum('assigned')
                ];
            })
            ->values();

        return response()->json($assignedItems);
    }

    public function updateStatus(ItemRequest $itemRequest, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,approved,assigned,returned,overdue,rejected,under_review,purchasing'
        ]);
        $itemRequest->status = $data['status'];
        $itemRequest->save();
        return response()->json($itemRequest);
    }

    public function respondToCustomRequest(ItemRequest $itemRequest, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:under_review,purchasing,approved,rejected',
            'admin_response' => 'nullable|string|max:1000'
        ]);

        $itemRequest->status = $data['status'];
        if (isset($data['admin_response'])) {
            $itemRequest->admin_response = $data['admin_response'];
        }
        $itemRequest->save();

        return response()->json($itemRequest);
    }

    public function destroy(ItemRequest $itemRequest): JsonResponse
    {
        $itemRequest->delete();
        return response()->json(null, 204);
    }
}




