<?php

declare(strict_types=1);

namespace TrashBin\Tests\Unit;

use PHPUnit\Framework\TestCase;
use TrashBin\Support\Paths;

final class PathsTest extends TestCase
{
    public function test_paths_are_joined_relative_to_the_root(): void
    {
        $this->assertSame('plugins/LuckPerms.jar', Paths::join('/plugins/', 'LuckPerms.jar'));
        $this->assertSame('world', Paths::join('/', 'world'));
        $this->assertSame('world', Paths::join(null, '/world'));
    }

    public function test_only_the_trash_folder_counts_as_trash(): void
    {
        $this->assertTrue(Paths::insideTrash('/.trash/abc/x.yml'));
        $this->assertTrue(Paths::insideTrash('.trash'));
        $this->assertFalse(Paths::insideTrash('.trashy/file'));
    }

    public function test_deletes_that_touch_the_trash_are_spotted(): void
    {
        $this->assertTrue(Paths::touchesTrash('/', ['world', '.trash']));
        $this->assertTrue(Paths::touchesTrash('/.trash/abc', ['x.yml']));
        $this->assertTrue(Paths::touchesTrash(null, ['/.trash/abc']));
        $this->assertFalse(Paths::touchesTrash('/plugins', ['.trash']));
        $this->assertFalse(Paths::touchesTrash('/', ['.trashy', 'world']));
    }

    public function test_taken_names_get_a_number(): void
    {
        $this->assertSame('config.yml', Paths::free('config.yml', ['other.yml']));
        $this->assertSame('config (2).yml', Paths::free('config.yml', ['config.yml', 'config (1).yml']));
        $this->assertSame('world (1)', Paths::free('world', ['world']));
    }
}
