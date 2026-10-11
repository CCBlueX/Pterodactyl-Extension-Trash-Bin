<?php

declare(strict_types=1);

namespace TrashBin\Panel;

use Pterodactyl\Http\Controllers\Api\Client\Servers\FileController;

/**
 * Only the file manager's own delete and list requests are changed. Deletes made by other
 * extensions, the console or the scheduler stay permanent.
 */
final class FileManager
{
    public static function is(string $method): bool
    {
        $route = request()->route();

        return $route !== null && $route->getControllerClass() === FileController::class && $route->getActionMethod() === $method;
    }
}
