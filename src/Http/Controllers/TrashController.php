<?php

declare(strict_types=1);

namespace TrashBin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use TrashBin\Models\Item;
use TrashBin\Settings;
use TrashBin\Trash;

final class TrashController
{
    public function __construct(private readonly Trash $trash, private readonly Settings $settings) {}

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorize($request, $server);
        $items = Item::query()->where('server_id', $server->id)->latest('deleted_at')->get();

        return new JsonResponse([
            'items' => $items->map(static fn (Item $item): array => $item->present()),
            'size' => (int) $items->sum('size'),
            'retention_days' => $this->settings->retentionDays(),
        ]);
    }

    public function restore(Request $request, Server $server, string $id): JsonResponse
    {
        $this->authorize($request, $server);

        $path = $this->trash->restore($server, $this->find($server, $id));

        return new JsonResponse(['path' => $path]);
    }

    public function destroy(Request $request, Server $server, string $id): JsonResponse
    {
        $this->authorize($request, $server);

        $this->trash->destroy($server, $this->find($server, $id));

        return $this->index($request, $server);
    }

    public function empty(Request $request, Server $server): JsonResponse
    {
        $this->authorize($request, $server);

        Item::query()->where('server_id', $server->id)->each(fn (Item $item) => $this->trash->destroy($server, $item));

        return $this->index($request, $server);
    }

    private function find(Server $server, string $id): Item
    {
        return Item::query()->where('server_id', $server->id)->findOrFail($id);
    }

    private function authorize(Request $request, Server $server): void
    {
        abort_unless((bool) $request->user()?->can('file.delete', $server), 403, 'You do not have permission to do that.');
    }
}
