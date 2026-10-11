<?php

declare(strict_types=1);

namespace TrashBin\Panel;

use Pterodactyl\Contracts\Files\ListsDirectories;
use Pterodactyl\Models\Server;
use TrashBin\Support\Paths;

/**
 * Keeps the trash folder out of the file manager's root listing.
 */
final readonly class HidingLister implements ListsDirectories
{
    public function __construct(private ListsDirectories $inner) {}

    public function list(Server $server, string $directory = '/'): array
    {
        $entries = $this->inner->list($server, $directory);

        if (mb_trim($directory, '/') !== '' || ! FileManager::is('directory')) {
            return $entries;
        }

        return array_values(array_filter($entries, static fn (array $entry): bool => ($entry['name'] ?? '') !== Paths::TRASH));
    }
}
