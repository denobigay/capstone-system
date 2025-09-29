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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->integer('quantity')->default(1);
            $table->integer('available')->default(1);
            $table->string('location');
            $table->text('description')->nullable();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->default(0);
            $table->enum('purchase_type', ['purchased', 'donated'])->default('purchased');
            $table->string('added_by');
            $table->enum('status', ['Available', 'Low Stock', 'Out of Stock'])->default('Available');
            $table->date('last_updated');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
