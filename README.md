# Obsidian plugin: Paste from history

## Usage

Text you copy or cut will be tracked. You then have the ability to paste text from those previous clipboard events.

You can adjust the limit of how many events are tracked in the settings. Defaults to 20 clipboard text events.

![Demo](./demo-v1-0-0.gif)

#### Commands

##### Paste from clipboard history

Opens a menu displaying a list of recent clipboard texts which can be chosen to paste into the editor.

Hotkey recommendation (needs to be set manually):

-   Linux & Windows: Ctrl + Shift + V
-   Mac: Command + Shift + V

##### Clear clipboard history

Removes all entries from the plugin's history of the clipboard.

## Limitations

-   Only text is supported currently.
-   Multiline text is displayed as _one_ line in preview.
-   Paste from history only works in the main editor.
-   Clipboard history is only kept in memory. Consequences:
    -   Clipboard history prior to plugin activation is not available.
    -   Clipboard history is lost between sessions.
    -   Clipboard history is not available between devices.

## Implementation details

Keeps a limited in-memory history of the text from clipboard `copy` and `cut` events seen by the `document` HTML DOM object in the Obsidian application.

## Licence

GNU LGPLv3

## Support
