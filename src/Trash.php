<?php

declare(strict_types=1);

namespace TrashBin;

use Illuminate\Support\Str;
use Pterodactyl\Contracts\Files\CreatesDirectories;
use Pterodactyl\Contracts\Files\DeletesFiles;
use Pterodactyl\Contracts\Files\ListsDirectories;
use Pterodactyl\Contracts\Files\RenamesFiles;
use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Models\Server;
use TrashBin\Models\Item;
use TrashBin\Support\Paths;

final readonly class Trash
{
    public function __construct(
        private RenamesFiles $renamer,
        private CreatesDirectories $directories,
        private ListsDirectories $lister,
        private DeletesFiles $deleter,
    ) {}

    /** @param list<string> $files Names relative to the root. */
    public function move(Server $server, ?string $root, array $files, ?int $userId): void
    {
        $entries = collect($this->lister->list($server, '/'.mb_trim((string) $root, '/')))->keyBy('name');

        foreach ($files as $file) {
            $path = Paths::join($root, $file);
            $entry = $entries->get(basename($path));
            $id = Str::lower(Str::random(12));

            $this->directories->create($server, $id, '/'.Paths::TRASH);
            $this->renamer->rename($server, '/', [['from' => $path, 'to' => Paths::TRASH."/{$id}/".basename($path)]]);

            Item::query()->create([
                'id' => $id,
                'server_id' => $server->id,
                'path' => $path,
                'directory' => ! ($entry['file'] ?? true),
                'size' => ($entry['file'] ?? false) ? (int) ($entry['size'] ?? 0) : null,
                'user_id' => $userId,
                'deleted_at' => now(),
            ]);
        }
    }

    /** Puts the item back where it was. A taken name gets a number, missing folders are created. */
    public function restore(Server $server, Item $item): string
    {
        $folder = dirname($item->path) === '.' ? '' : dirname($item->path);

        try {
            $taken = array_column($this->lister->list($server, '/'.$folder), 'name');
        } catch (DaemonConnectionException) {
            $taken = [];
            $this->directories->create($server, $folder, '/');
        }

        $target = Paths::join($folder, Paths::free($item->name(), $taken));

        $this->renamer->rename($server, '/', [['from' => $item->location(), 'to' => $target]]);
        $this->deleter->delete($server, '/'.Paths::TRASH, [$item->id]);
        $item->delete();

        Activity::event('server:file.rename')->subject($server)->property(['directory' => '/', 'files' => [['from' => $item->location(), 'to' => $target]], 'via' => 'trash-bin'])->log();

        return '/'.$target;
    }

    public function destroy(Server $server, Item $item): void
    {
        $this->deleter->delete($server, '/'.Paths::TRASH, [$item->id]);
        $item->delete();

        Activity::event('server:file.delete')->subject($server)->property(['directory' => '/'.Paths::TRASH, 'files' => [$item->name()], 'via' => 'trash-bin'])->log();
    }
}
