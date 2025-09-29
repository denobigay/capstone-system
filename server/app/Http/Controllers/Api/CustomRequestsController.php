<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomRequestsController extends Controller
{
    public function index(): JsonResponse
    {
        $customRequests = CustomRequest::orderByDesc('created_at')->get();
        return response()->json($customRequests);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item_name' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'teacher_id' => 'nullable|integer',
            'quantity_requested' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'subject' => 'nullable|string|max:500',
            'description' => 'nullable|string', // Make description optional
            'notes' => 'nullable|string',
            'photo' => 'nullable|string|max:16777215', // Max for MEDIUMTEXT in MySQL
        ]);

        $data['status'] = 'pending';

        try {
            $customRequest = CustomRequest::create($data);
            return response()->json(['custom_request' => $customRequest], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating custom request: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create custom request'], 500);
        }
    }

    public function show(CustomRequest $customRequest): JsonResponse
    {
        return response()->json($customRequest);
    }

    public function update(Request $request, CustomRequest $customRequest): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,under_review,purchasing,approved,rejected',
            'admin_response' => 'nullable|string|max:1000'
        ]);

        $customRequest->update($data);
        return response()->json($customRequest);
    }

    public function destroy(CustomRequest $customRequest): JsonResponse
    {
        $customRequest->delete();
        return response()->json(['message' => 'Custom request deleted successfully']);
    }

    public function respondToCustomRequest(CustomRequest $customRequest, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:under_review,purchasing,approved,rejected',
            'admin_response' => 'nullable|string|max:1000'
        ]);

        $customRequest->status = $data['status'];
        if (isset($data['admin_response'])) {
            $customRequest->admin_response = $data['admin_response'];
        }
        $customRequest->save();

        return response()->json($customRequest);
    }

    public function updatePurchasingRequest(CustomRequest $customRequest, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_response' => 'nullable|string|max:1000',
            'item_id' => 'nullable|integer|exists:inventory_items,id',
            'quantity_assigned' => 'nullable|integer|min:1',
            'due_date' => 'nullable|date'
        ]);

        $customRequest->status = $data['status'];
        if (isset($data['admin_response'])) {
            $customRequest->admin_response = $data['admin_response'];
        }
        $customRequest->save();

        // If approved and item_id is provided, create an assigned item record
        if ($data['status'] === 'approved' && isset($data['item_id'])) {
            // Create a new item request record for the assigned item
            $itemRequest = \App\Models\ItemRequest::create([
                'item_id' => $data['item_id'],
                'item_name' => $customRequest->item_name,
                'teacher_name' => $customRequest->teacher_name,
                'teacher_id' => $customRequest->teacher_id,
                'quantity_requested' => $customRequest->quantity_requested,
                'quantity_assigned' => $data['quantity_assigned'] ?? $customRequest->quantity_requested,
                'location' => $customRequest->location,
                'subject' => $customRequest->subject,
                'notes' => 'Assigned from custom request #' . $customRequest->id,
                'status' => 'assigned',
                'due_date' => $data['due_date'] ?? now()->addDays(30),
                'assigned_at' => now(),
                'request_type' => 'item'
            ]);

            // Update inventory availability
            $inventoryItem = \App\Models\InventoryItem::find($data['item_id']);
            if ($inventoryItem) {
                $inventoryItem->available -= ($data['quantity_assigned'] ?? $customRequest->quantity_requested);
                $inventoryItem->save();
            }
        }

        return response()->json($customRequest);
    }
}
