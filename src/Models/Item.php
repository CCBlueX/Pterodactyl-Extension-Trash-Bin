<?php

declare(strict_types=1);

namespace TrashBin\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Server;
use TrashBin\Support\Paths;

/**
 * @property string $id
 * @property int $server_id
 * @property string $path Where it was before, relative to the server root.
 * @property bool $directory
 * @property int|null $size
 * @property int|null $user_id
 * @property \Carbon\CarbonImmutable $deleted_at
 * @property Server $server
 */
final class Item extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'ext_trash_bin_items';

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['directory' => 'boolean', 'size' => 'integer', 'deleted_at' => 'immutable_datetime'];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function name(): string
    {
        return basename($this->path);
    }

    /** Where it is now, relative to the server root. */
    public function location(): string
    {
        return Paths::TRASH."/{$this->id}/{$this->name()}";
    }

    /** @return array<string, mixed> */
    public function present(): array
    {
        $folder = dirname($this->path);

        return [
            'id' => $this->id,
            'name' => $this->name(),
            'folder' => '/'.($folder === '.' ? '' : $folder),
            'directory' => $this->directory,
            'size' => $this->size,
            'deleted_at' => $this->deleted_at->toAtomString(),
        ];
    }
}
