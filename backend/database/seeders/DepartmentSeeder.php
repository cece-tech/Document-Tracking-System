<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources',  'code' => 'HR',    'description' => 'People and culture'],
            ['name' => 'Finance',          'code' => 'FIN',   'description' => 'Accounting and budgets'],
            ['name' => 'Information Technology', 'code' => 'IT', 'description' => 'Tech and systems'],
            ['name' => 'Operations',       'code' => 'OPS',   'description' => 'Daily operations'],
            ['name' => 'Legal',            'code' => 'LEGAL', 'description' => 'Compliance and contracts'],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                ['code' => $dept['code']],
                $dept
            );
        }
    }
}