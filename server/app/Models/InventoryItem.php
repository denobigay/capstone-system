<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'quantity',
        'available',
        'location',
        'description',
        'serial_number',
        'purchase_date',
        'purchase_price',
        'purchase_type',
        'added_by',
        'status',
        'photo',
        'last_updated'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'last_updated' => 'date',
        'purchase_price' => 'decimal:2'
    ];
}
