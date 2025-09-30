<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items.
     */
    public function index(): JsonResponse
    {
        $items = InventoryItem::all();
        return response()->json($items);
    }

    /**
     * Store a newly created inventory item.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date_format:Y-m-d',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_type' => 'nullable|string|max:255',
            'added_by' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'photo' => 'nullable|string'
        ]);

        $itemData = [
            'name' => $request->name,
            'category' => $request->category,
            'quantity' => $request->quantity,
            'available' => $request->available,
            'location' => $request->location,
            'description' => $request->description,
            'serial_number' => $request->serial_number,
            'purchase_date' => $request->purchase_date,
            'purchase_price' => $request->purchase_price ?? 0,
            'purchase_type' => $request->purchase_type ?? 'purchased',
            'added_by' => $request->added_by ?? 'Admin User',
            'status' => $request->status ?? 'Available',
            'last_updated' => now()->toDateString()
        ];

        // Handle photo (base64 string from frontend)
        if ($request->has('photo') && $request->photo) {
            // Check if it's a base64 image
            if (str_starts_with($request->photo, 'data:image/')) {
                // Convert base64 to file
                $imageData = $request->photo;
                $imageData = str_replace('data:image/png;base64,', '', $imageData);
                $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
                $imageData = str_replace('data:image/jpg;base64,', '', $imageData);
                $imageData = str_replace(' ', '+', $imageData);

                $imageData = base64_decode($imageData);
                $fileName = time() . '_inventory_photo.jpg';
                $filePath = 'uploads/' . $fileName;

                // Ensure uploads directory exists
                if (!file_exists(public_path('uploads'))) {
                    mkdir(public_path('uploads'), 0755, true);
                }

                // Save to uploads folder
                file_put_contents(public_path($filePath), $imageData);
                $itemData['photo'] = $filePath;
            } else {
                // Regular string (existing photo path)
                $itemData['photo'] = $request->photo;
            }
        }

        $item = InventoryItem::create($itemData);

        return response()->json($item, 201);
    }

    /**
     * Display the specified inventory item.
     */
    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        return response()->json($inventoryItem);
    }

    /**
     * Update the specified inventory item.
     */
    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_type' => 'required|in:purchased,donated',
            'added_by' => 'required|string|max:255',
            'status' => 'required|in:Available,Low Stock,Out of Stock',
            'photo' => 'nullable|string'
        ]);

        $updateData = [
            'name' => $request->name,
            'category' => $request->category,
            'quantity' => $request->quantity,
            'available' => $request->available,
            'location' => $request->location,
            'description' => $request->description,
            'serial_number' => $request->serial_number,
            'purchase_date' => $request->purchase_date,
            'purchase_price' => $request->purchase_price ?? 0,
            'purchase_type' => $request->purchase_type,
            'added_by' => $request->added_by,
            'status' => $request->status,
            'last_updated' => now()->toDateString()
        ];

        // Handle photo (base64 string from frontend)
        if ($request->has('photo') && $request->photo) {
            // Check if it's a base64 image
            if (str_starts_with($request->photo, 'data:image/')) {
                // Delete old photo if exists
                if ($inventoryItem->photo && !str_starts_with($inventoryItem->photo, 'http')) {
                    $oldPhotoPath = public_path($inventoryItem->photo);
                    if (file_exists($oldPhotoPath)) {
                        unlink($oldPhotoPath);
                    }
                }

                // Convert base64 to file
                $imageData = $request->photo;
                $imageData = str_replace('data:image/png;base64,', '', $imageData);
                $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
                $imageData = str_replace('data:image/jpg;base64,', '', $imageData);
                $imageData = str_replace(' ', '+', $imageData);

                $imageData = base64_decode($imageData);
                $fileName = time() . '_inventory_photo.jpg';
                $filePath = 'uploads/' . $fileName;

                // Save to uploads folder
                file_put_contents(public_path($filePath), $imageData);
                $updateData['photo'] = $filePath;
            } else {
                // Regular string (existing photo path)
                $updateData['photo'] = $request->photo;
            }
        }

        $inventoryItem->update($updateData);

        return response()->json($inventoryItem);
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->delete();
        return response()->json(null, 204);
    }

    /**
     * Search for inventory item by QR code.
     */
    public function search(Request $request): JsonResponse
    {
        $qr = $request->query('qr');

        if (!$qr) {
            return response()->json(['error' => 'QR code parameter is required'], 400);
        }

        // Parse QR data to extract serial number pattern
        $parts = explode('-', $qr);
        if (count($parts) >= 2 && $parts[0] === 'ITEM') {
            $timestamp = $parts[1];
            $serialPattern = "QR-{$timestamp}";

            $item = InventoryItem::where('serial_number', 'LIKE', "%{$serialPattern}%")
                                ->orWhere('serial_number', 'LIKE', "%{$timestamp}%")
                                ->first();

            if ($item) {
                return response()->json([
                    'exists' => true,
                    'item' => $item
                ]);
            }
        }

        return response()->json([
            'exists' => false,
            'item' => null
        ]);
    }
}
