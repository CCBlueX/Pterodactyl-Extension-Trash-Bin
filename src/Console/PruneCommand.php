<?php

declare(strict_types=1);

namespace TrashBin\Console;

use Illuminate\Console\Command;
use Throwable;
use TrashBin\Models\Item;
use TrashBin\Settings;
use TrashBin\Trash;

final class PruneCommand extends Command
{
    protected $signature = 'trash-bin:prune';

    protected $description = 'Delete trashed files that are past their retention.';

    public function handle(Trash $trash, Settings $settings): int
    {
        $days = $settings->retentionDays();

        if ($days === 0) {
            return self::SUCCESS;
        }

        $deleted = 0;

        Item::query()->with('server')->where('deleted_at', '<', now()->subDays($days))->each(function (Item $item) use ($trash, &$deleted): void {
            try {
                $trash->destroy($item->server, $item);
                $deleted++;
            } catch (Throwable $exception) {
                report($exception);
            }
        });

        $this->info("Deleted {$deleted} trashed items.");

        return self::SUCCESS;
    }
}
