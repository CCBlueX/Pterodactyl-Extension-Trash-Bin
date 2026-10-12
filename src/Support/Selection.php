<?php

declare(strict_types=1);

namespace TrashBin\Support;

use InvalidArgumentException;

/**
 * Files ticked in the file manager: a folder and names directly inside it.
 */
final readonly class Selection
{
    /** @param list<string> $names */
    private function __construct(public string $root, public array $names) {}

    /**
     * @param  array<array-key, mixed>  $names
     *
     * @throws InvalidArgumentException When a name is not a plain file name, the folder leaves the server or it points into the trash.
     */
    public static function of(?string $root, array $names): self
    {
        $segments = array_values(array_filter(explode('/', (string) $root), static fn (string $segment): bool => $segment !== '' && $segment !== '.'));

        if (in_array('..', $segments, true)) {
            throw new InvalidArgumentException('That folder is not on this server.');
        }

        $clean = [];

        foreach ($names as $name) {
            $name = is_string($name) ? mb_trim($name, '/') : '';

            if ($name === '' || $name === '.' || $name === '..' || str_contains($name, '/')) {
                throw new InvalidArgumentException('Pick files from the file manager.');
            }

            $clean[] = $name;
        }

        $selection = new self('/'.implode('/', $segments), array_values(array_unique($clean)));

        if ($selection->names === []) {
            throw new InvalidArgumentException('Pick at least one file.');
        }

        if (Paths::touchesTrash($selection->root, $selection->names)) {
            throw new InvalidArgumentException('Files in the trash are deleted from the Trash screen.');
        }

        return $selection;
    }
}
