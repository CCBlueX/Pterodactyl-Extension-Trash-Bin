<?php

declare(strict_types=1);

namespace TrashBin\Support;

final class Paths
{
    public const string TRASH = '.trash';

    /** A path relative to the server root, without leading or trailing slashes. */
    public static function join(?string $root, string $name): string
    {
        return mb_trim(mb_trim((string) $root, '/').'/'.mb_trim($name, '/'), '/');
    }

    public static function insideTrash(string $path): bool
    {
        $path = mb_trim($path, '/');

        return $path === self::TRASH || str_starts_with($path, self::TRASH.'/');
    }

    /**
     * Whether deleting these names in the folder would touch the trash folder or what is in it.
     *
     * @param  array<array-key, mixed>  $names
     */
    public static function touchesTrash(?string $root, array $names): bool
    {
        if (self::insideTrash((string) $root)) {
            return true;
        }

        foreach ($names as $name) {
            if (self::insideTrash(self::join($root, (string) $name))) {
                return true;
            }
        }

        return false;
    }

    /**
     * The name, or the first free "name (n).ext" when it is taken.
     *
     * @param  list<string>  $taken
     */
    public static function free(string $name, array $taken): string
    {
        if (! in_array($name, $taken, true)) {
            return $name;
        }

        $dot = mb_strrpos($name, '.');
        [$base, $extension] = $dot > 0 ? [mb_substr($name, 0, $dot), mb_substr($name, $dot)] : [$name, ''];

        for ($i = 1; ; $i++) {
            if (! in_array("{$base} ({$i}){$extension}", $taken, true)) {
                return "{$base} ({$i}){$extension}";
            }
        }
    }
}
