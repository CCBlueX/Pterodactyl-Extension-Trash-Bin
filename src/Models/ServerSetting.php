<?php

declare(strict_types=1);

namespace TrashBin\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;

/**
 * @property int $server_id
 * @property bool $enabled Whether the file manager's deletes go to the trash.
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property User|null $user
 */
final class ServerSetting extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'ext_trash_bin_settings';

    protected $primaryKey = 'server_id';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['enabled' => 'boolean', 'updated_at' => 'immutable_datetime'];
    }

    /** Servers that never changed it trash their deletes. */
    public static function trashes(Server $server): bool
    {
        return (bool) (self::query()->whereKey($server->id)->value('enabled') ?? true);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
