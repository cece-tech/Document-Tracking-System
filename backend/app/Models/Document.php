<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'title', 'description', 'file_path', 'file_name',
        'status', 'user_id', 'department_id',
        'reviewed_by', 'remarks', 'reviewed_at'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
    public function sender() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function receiverDepartment() {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function logs()
    {
        return $this->hasMany(DocumentLog::class);
    }
}