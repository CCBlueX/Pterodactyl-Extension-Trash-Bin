<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Each trashed file or folder lives in /.trash/<id>/<name> on the server.
        Schema::create('ext_trash_bin_items', function (Blueprint $table): void {
            $table->char('id', 12)->primary();
            $table->unsignedInteger('server_id');
            $table->string('path', 1024);
            $table->boolean('directory');
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('user_id')->nullable();
            $table->timestamp('deleted_at');

            $table->index(['server_id', 'deleted_at']);
            $table->foreign('server_id')->references('id')->on('servers')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_trash_bin_items');
    }
};
