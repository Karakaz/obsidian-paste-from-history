import { Command, Editor, Hotkey, IconName, MarkdownView, Menu, MenuItem } from "obsidian";
import { EditorView } from "@codemirror/view";

import { ClipboardHistoryService } from "../ClipboardHistoryService";
import { ClipboardRecord } from "../models/ClipboardRecord";

export class PasteFromClipboardHistoryCommand implements Command {
	id: string = "paste-from-clipboard-history";
	name: string = "Paste from clipboard history";
	icon: IconName = "clipboard-list";
	hotkeys: Hotkey[] = [{ modifiers: ["Mod", "Shift"], key: "v" }];

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	editorCallback(editor: Editor, view: MarkdownView) {
		// @ts-expect-error, not typed
		const editorView = view.editor.cm as EditorView;
		const cursor = editor.getCursor();
		const position = editorView.coordsAtPos(editor.posToOffset(cursor), -1);
		if (position) {
			const menu = this.createMenu(editor);
			menu.showAtPosition({ x: position.left, y: position.bottom });
		}
	}

	private createMenu(editor: Editor): Menu {
		const menu = new Menu();

		const records = this.clipboardHistoryService.getRecords();
        for (let index = 0; index < records.length; index++) {
            menu.addItem((item) => this.decorateItemWithClipboardRecord(editor, item, records[index], index + 1));
        }

		menu.addSeparator();
		menu.addItem((item) => item.setDisabled(true).setIcon("clipboard-paste").setTitle("Clipboard History"));

		return menu;
	}

	private decorateItemWithClipboardRecord(editor: Editor, item: MenuItem, record: ClipboardRecord, label: number) {
		const documentFragment = new DocumentFragment();

		const rowDiv = documentFragment.createDiv();
		rowDiv.addClass("clipboardHistoryRecord");

		const labelSpan = rowDiv.createSpan();
		labelSpan.appendText(`${label}: `);
		labelSpan.addClass("clipboardHistoryRecordLabel");

		const textSpan = rowDiv.createSpan();
		textSpan.appendText(record.text.replace(/\n/g, '⏎'));
		textSpan.addClass("clipboardHistoryRecordText");

		item.setTitle(documentFragment);
        item.onClick(() => this.pasteRecordIntoEditor(editor, record));
	}
    
    private pasteRecordIntoEditor(editor: Editor, record: ClipboardRecord) {
        editor.replaceSelection(record.text);
        this.clipboardHistoryService.refreshRecord(record);
    }
}
