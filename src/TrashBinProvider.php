<?php

declare(strict_types=1);

namespace TrashBin;

use Illuminate\Console\Scheduling\Schedule;
use Pterodactyl\Contracts\Files\DeletesFiles;
use Pterodactyl\Contracts\Files\ListsDirectories;
use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;
use TrashBin\Console\PruneCommand;
use TrashBin\Panel\HidingLister;
use TrashBin\Panel\TrashingDeleter;

class TrashBinProvider extends ExtensionProvider
{
    public function boot(): void
    {
        $this->registerApiRoutes();
        $this->loadExtensionMigrations();

        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('retention_days', 'retention_days', 30, ['required', 'integer', 'min:0', 'max:365'])
                ->label('Keep trashed files for (days)')
                ->help('0 keeps them until the trash is emptied. Trashed files count towards the server\'s disk space.')
                ->field('number'),
        ]));

        $this->wrapAction(DeletesFiles::class, static fn (DeletesFiles $inner): DeletesFiles => new TrashingDeleter($inner));
        $this->wrapAction(ListsDirectories::class, static fn (ListsDirectories $inner): ListsDirectories => new HidingLister($inner));

        $this->registerCommands([PruneCommand::class]);
        $this->registerSchedule(static function (Schedule $schedule): void {
            $schedule->command('trash-bin:prune')->dailyAt('04:40')->withoutOverlapping()->runInBackground();
        });
    }
}
