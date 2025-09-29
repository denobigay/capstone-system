<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function index(): JsonResponse
    {
        \Log::info('Reports index request received');
        $reports = Report::orderByDesc('created_at')->get();
        \Log::info('Reports found', ['count' => $reports->count()]);
        return response()->json($reports);
    }

    public function store(Request $request): JsonResponse
    {
        \Log::info('Report store request received', [
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        $data = $request->validate([
            'teacher_name' => 'required|string|max:255',
            'teacher_id' => 'nullable|integer',
            'location' => 'required|string|max:255',
            'subject' => 'nullable|string|max:500',
            'description' => 'required|string',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string|max:16777215', // Max for MEDIUMTEXT in MySQL
        ]);

        $data['status'] = 'pending';

        try {
            $report = Report::create($data);
            \Log::info('Report created successfully', ['report_id' => $report->id]);
            return response()->json(['report' => $report], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating report: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);
            return response()->json(['error' => 'Failed to create report: ' . $e->getMessage()], 500);
        }
    }

    public function show(Report $report): JsonResponse
    {
        return response()->json($report);
    }

    public function update(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,under_review,in_progress,resolved,rejected',
            'admin_response' => 'nullable|string|max:1000'
        ]);

        $report->update($data);
        return response()->json($report);
    }

    public function destroy(Report $report): JsonResponse
    {
        $report->delete();
        return response()->json(['message' => 'Report deleted successfully']);
    }

    public function respondToReport(Report $report, Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:under_review,in_progress,resolved,rejected',
            'admin_response' => 'nullable|string|max:1000'
        ]);

        $report->status = $data['status'];
        if (isset($data['admin_response'])) {
            $report->admin_response = $data['admin_response'];
        }
        $report->save();

        return response()->json($report);
    }
}
