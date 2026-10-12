<?php

declare(strict_types=1);

namespace TrashBin\Tests\Unit;

use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use TrashBin\Support\Selection;

final class SelectionTest extends TestCase
{
    /** @return iterable<string, array{0: string|null, 1: array<array-key, mixed>}> */
    public static function refused(): iterable
    {
        yield 'parent folder' => ['/plugins/../..', ['a']];
        yield 'nothing picked' => ['/', []];
        yield 'empty name' => ['/', ['']];
        yield 'dot name' => ['/', ['..']];
        yield 'nested path' => ['/', ['world/region']];
        yield 'not a string' => ['/', [5]];
        yield 'the trash itself' => ['/', ['.trash']];
        yield 'inside the trash' => ['/.trash/abcdefghijkl', ['config.yml']];
    }

    public function test_the_folder_and_names_are_cleaned_up(): void
    {
        $selection = Selection::of('plugins//Essentials/./', ['config.yml', '/userdata/', 'config.yml']);

        $this->assertSame('/plugins/Essentials', $selection->root);
        $this->assertSame(['config.yml', 'userdata'], $selection->names);
        $this->assertSame('/', Selection::of(null, ['world'])->root);
    }

    /** @param array<array-key, mixed> $names */
    #[DataProvider('refused')]
    public function test_unsafe_selections_are_refused(?string $root, array $names): void
    {
        $this->expectException(InvalidArgumentException::class);

        Selection::of($root, $names);
    }
}
