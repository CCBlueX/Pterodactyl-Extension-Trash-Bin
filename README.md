# Trash Bin for Pterodactyl

[![Release](https://img.shields.io/github/v/release/CCBlueX/Pterodactyl-Extension-Trash-Bin?style=flat-square)](https://github.com/CCBlueX/Pterodactyl-Extension-Trash-Bin/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/CCBlueX/Pterodactyl-Extension-Trash-Bin/total?style=flat-square)](https://github.com/CCBlueX/Pterodactyl-Extension-Trash-Bin/releases)
[![Pterodactyl](https://img.shields.io/badge/Pterodactyl-2.0-0e4688?style=flat-square)](https://pterodactyl.io)
[![License](https://img.shields.io/github/license/CCBlueX/Pterodactyl-Extension-Trash-Bin?style=flat-square)](LICENSE)

Files deleted in the file manager go to a trash first, so a wrong click can be undone. Works with every game.

![Trash](docs/screenshots/trash.png)

## Install

1. Download `trash-bin-<version>.pteroext` from the [latest release](https://github.com/CCBlueX/Pterodactyl-Extension-Trash-Bin/releases/latest).
2. Install and enable it under **Admin → Extensions**.
3. Delete a file as usual, then open the server's **Trash** tab.

## Features

- **Restore**: files and folders go back where they were. Missing folders are recreated, taken names get a number.
- **Delete forever** or **Empty trash** when you need the space.
- **Cleans up**: trashed files are deleted after 30 days, or keep them until you empty the trash.
- **Stays out of the way**: the trash folder is hidden from the file manager, and only deletes made there are trashed.
- **Same permissions**: anyone who can delete files can use the trash.

Trashed files still count towards the server's disk space.
