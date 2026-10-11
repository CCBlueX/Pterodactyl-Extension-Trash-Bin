<?php

declare(strict_types=1);

namespace TrashBin;

use Pterodactyl\Services\Extensions\ExtensionSettingsRegistry;

final readonly class Settings
{
    public function __construct(private ExtensionSettingsRegistry $registry) {}

    /** 0 keeps items until the trash is emptied. */
    public function retentionDays(): int
    {
        return max(0, (int) ($this->registry->get('trash-bin')?->get('retention_days') ?? 30));
    }
}
