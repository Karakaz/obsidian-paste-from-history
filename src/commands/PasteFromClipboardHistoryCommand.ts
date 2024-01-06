import { Command, Editor, IconName, MarkdownView, Menu, MenuItem, MenuPositionDef } from "obsidian";
import { EditorView } from "@codemirror/view";

import { ClipboardHistoryService } from "../ClipboardHistoryService";
import { ClipboardRecord } from "../models/ClipboardRecord";

export class PasteFromClipboardHistoryCommand implements Command {
	id = "paste-from-clipboard-history";
	name = "Paste from clipboard history";
	icon: IconName = "clipboard-list";

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	editorCallback(editor: Editor, view: MarkdownView) {
		// @ts-expect-error, not typed
		const editorView = view.editor.cm as EditorView;
		const cursor = editor.getCursor();
		const cursorOffset = editor.posToOffset(cursor);
		let position = this.getCursorPosition(cursorOffset, editorView);
		if (!position) {
			position = this.getNextAvailablePosition(cursor.line, editor, editorView);
		}
		if (!position) {
			position = this.getCenterPosition(editorView);
		}
		const menu = this.createMenu(editor);
		menu.showAtPosition(position);
	}

	private getCursorPosition(cursorOffset: number, editorView: EditorView): MenuPositionDef | undefined {
		const position = editorView.coordsAtPos(cursorOffset, -1);
		if (position) {
			return { x: position.left, y: position.bottom };
		}
	}

	private getNextAvailablePosition(
		cursorLine: number,
		editor: Editor,
		editorView: EditorView
	): MenuPositionDef | undefined {
		const lineCount = editor.lineCount();
		for (let line = cursorLine + 1; line < lineCount; line++) {
			const startOfLine = editor.posToOffset({ line: line, ch: 0 });
			const position = editorView.coordsAtPos(startOfLine, -1);
			if (position) {
				return { x: position.left, y: position.top };
			}
		}
	}

	private getCenterPosition(editorView: EditorView): MenuPositionDef {
		// @ts-expect-error, not typed
		return { x: editorView.viewState.editorWidth / 2, y: editorView.viewState.editorHeight / 2 };
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
		textSpan.appendText(record.text.replace(/\n/g, "⏎"));
		textSpan.addClass("clipboardHistoryRecordText");

		item.setTitle(documentFragment);
		item.onClick(() => this.pasteRecordIntoEditor(editor, record));
	}

	private pasteRecordIntoEditor(editor: Editor, record: ClipboardRecord) {
		editor.replaceSelection(record.text);
		this.clipboardHistoryService.refreshRecord(record);
		navigator.clipboard.writeText(record.text);
	}
}
