<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PrototypeController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'app' => config('app.name'),
        ]);
    }

    public function sampleData(): JsonResponse
    {
        return response()->json([
            'message' => 'Prototype API is connected',
            'features' => [
                'auth' => false,
                'storage' => false,
                'ui' => 'figma-based',
            ],
        ]);
    }
}


