# Obsidian plugin: Paste from history

## Usage

Text you `copy` or `cut` will be tracked. You then have the ability to `paste` text from those previous _clipboard events_.

![Demo](./demo-v1-0-0.gif)

### Commands

#### Paste from clipboard history

Opens a menu displaying a list of recent clipboard texts which can be chosen to paste into the editor.

##### Hotkey
I recommend the following, but choose a hotkey that fits well with your other hotkeys:

-   Linux & Windows: Ctrl + Shift + V
-   Mac: Command + Shift + V

#### Clear clipboard history

Removes all entries from the plugin's history of the clipboard.

### Settings

#### History limit
You can adjust the limit of how many clipboard text events are tracked in the settings. The default is `20`.

## Limitations

-   [Paste from clipboard history](#paste-from-clipboard-history) only works inside _editing view_.
-   Only text is supported currently.
-   Multiline text is displayed as _one_ line in preview.
-   Clipboard history is kept in memory. Consequences:
    -   Clipboard history prior to plugin activation is not available.
    -   Clipboard history is lost between sessions.
    -   Clipboard history is not available between devices.

## Implementation details

Keeps a limited in-memory history of the text from clipboard `copy` and `cut` events seen by the `document` HTML DOM object in the Obsidian application.

## Licence

GNU LGPLv3

## Support
