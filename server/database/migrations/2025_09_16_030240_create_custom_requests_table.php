<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('custom_requests', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('teacher_name');
            $table->integer('teacher_id')->nullable();
            $table->integer('quantity_requested');
            $table->string('location');
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->text('photo')->nullable();
            $table->enum('status', ['pending', 'under_review', 'purchasing', 'approved', 'rejected'])->default('pending');
            $table->text('admin_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_requests');
    }
};
