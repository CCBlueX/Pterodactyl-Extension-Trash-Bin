<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per server that changed a setting; servers without a row use the defaults.
        Schema::create('ext_trash_bin_settings', function (Blueprint $table): void {
            $table->unsignedInteger('server_id')->primary();
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('updated_by')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_trash_bin_settings');
    }
};
