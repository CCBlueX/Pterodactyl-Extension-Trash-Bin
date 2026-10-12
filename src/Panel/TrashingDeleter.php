<?php

declare(strict_types=1);

namespace TrashBin\Panel;

use Pterodactyl\Contracts\Files\DeletesFiles;
use Pterodactyl\Models\Server;
use TrashBin\Models\ServerSetting;
use TrashBin\Support\Paths;
use TrashBin\Trash;

/**
 * Moves what the file manager deletes into the trash, unless the server turned that off.
 * Deleting inside the trash is final.
 */
final readonly class TrashingDeleter implements DeletesFiles
{
    public function __construct(private DeletesFiles $inner) {}

    public function delete(Server $server, ?string $root, array $files): void
    {
        if (! FileManager::is('delete') || Paths::touchesTrash($root, $files) || ! ServerSetting::trashes($server)) {
            $this->inner->delete($server, $root, $files);

            return;
        }

        app(Trash::class)->move($server, $root, array_map(strval(...), $files), request()->user()?->id);
    }
}
