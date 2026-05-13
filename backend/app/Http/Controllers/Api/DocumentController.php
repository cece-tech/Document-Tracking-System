<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentLog;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    // List documents (filtered by role)
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Document::with(['user', 'department', 'reviewer']);

        if ($user->isAdmin()) {
            // Admin sees all
        } elseif ($user->isDeptHead()) {
            // Dept head sees their dept
            $query->where('department_id', $user->department_id);
        } else {
            // Staff sees only their own
            $query->where('user_id', $user->id);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by department (admin only)
        if ($request->department_id && $user->isAdmin()) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->latest()->paginate(15));
    }

    // Submit a document
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'department_id' => 'required|exists:departments,id',
            'file' => 'nullable|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg|max:20480',
        ]);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file     = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('documents', 'public');
        }

        $document = Document::create([
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'department_id' => $data['department_id'],
            'user_id'       => $request->user()->id,
            'file_path'     => $filePath,
            'file_name'     => $fileName,
            'status'        => 'pending',
        ]);

        DocumentLog::create([
            'document_id' => $document->id,
            'user_id'     => $request->user()->id,
            'action'      => 'submitted',
        ]);

        return response()->json($document->load(['user', 'department']), 201);
    }

    // View single document
    public function show(Request $request, Document $document)
    {
        $user = $request->user();

        // Access control
        if (!$user->isAdmin() && !$user->isDeptHead()
            && $document->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(
            $document->load(['user', 'department', 'reviewer', 'logs.user'])
        );
    }

    // Approve or reject
    public function review(Request $request, Document $document)
    {
        $user = $request->user();

        if (!$user->isAdmin() && !$user->isDeptHead()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'status'  => 'required|in:approved,rejected',
            'remarks' => 'nullable|string',
        ]);

        $document->update([
            'status'      => $data['status'],
            'remarks'     => $data['remarks'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        DocumentLog::create([
            'document_id' => $document->id,
            'user_id'     => $user->id,
            'action'      => $data['status'],
            'notes'       => $data['remarks'] ?? null,
        ]);

        return response()->json($document->load(['user', 'department', 'reviewer']));
    }

    public function download(Document $document)
    {
        if (!$document->file_path) {
            return response()->json(['message' => 'No file attached'], 404);
        }

        return response()->download(
            storage_path('app/public/' . $document->file_path),
            $document->file_name
        );
    }

    // Delete (admin only)
    public function destroy(Request $request, Document $document)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }
}