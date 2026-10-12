<?php

declare(strict_types=1);

namespace TrashBin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use InvalidArgumentException;
use Pterodactyl\Contracts\Files\DeletesFiles;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Models\Server;
use TrashBin\Support\Selection;

/**
 * Deletes files from the file manager for good, without the trash.
 */
final readonly class PermanentDeleteController
{
    public function __construct(private DeletesFiles $deleter) {}

    public function delete(Request $request, Server $server): JsonResponse
    {
        abort_unless((bool) $request->user()?->can('file.delete', $server), 403, 'You do not have permission to do that.');

        $data = $request->validate([
            'root' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'files' => ['required', 'array', 'min:1', 'max:1000'],
            'files.*' => ['required', 'string', 'max:255'],
        ]);

        try {
            $selection = Selection::of($data['root'] ?? null, $data['files']);
        } catch (InvalidArgumentException $exception) {
            abort(422, $exception->getMessage());
        }

        // This is not the file manager's delete route, so the trashing wrapper passes it straight through.
        $this->deleter->delete($server, $selection->root, $selection->names);

        Activity::event('server:file.delete')->subject($server)->property(['directory' => $selection->root, 'files' => $selection->names, 'via' => 'trash-bin', 'permanent' => true])->log();

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}
