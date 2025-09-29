<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('item_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id');
            $table->string('item_name');
            $table->string('teacher_name');
            $table->unsignedBigInteger('teacher_id')->nullable();
            $table->integer('quantity_requested');
            $table->integer('quantity_assigned')->default(0);
            $table->string('location');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending','approved','assigned','returned','overdue','rejected'])->default('pending');
            $table->enum('return_status', ['returned','not_returned','overdue'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_requests');
    }
};


