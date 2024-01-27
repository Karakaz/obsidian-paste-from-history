import { Editor, MarkdownView, Menu, MenuItem, MenuPositionDef } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { EditorView } from "@codemirror/view";
import { HistoryViewType } from "src/models/HistoryViewType";

export class HistoryViewMenu implements HistoryView {
	displayedMenu?: Menu;

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	type = () => HistoryViewType.MENU;

	close() {
		if (this.displayedMenu) {
			this.displayedMenu.close();
		}
	}

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close();
		this.displayedMenu = this.createMenu(pasteAction);

		const position = this.findViableMenuPosition(view, editor);
		this.displayedMenu.showAtPosition(position);
	}

	private createMenu(pasteAction: (record: ClipboardRecord) => void): Menu {
		const menu = new Menu();

		const records = this.clipboardHistoryService.getRecords();
		for (let index = 0; index < records.length; index++) {
			menu.addItem((item) => this.decorateItemWithClipboardRecord(pasteAction, item, records[index], index + 1));
		}

		menu.addSeparator();
		menu.addItem((item) => item.setDisabled(true).setIcon("clipboard-paste").setTitle("Clipboard History"));

		return menu;
	}

	setPreviewLines(numberOfLines: number) {
		throw new Error("Unsupported operation");
	}

	private decorateItemWithClipboardRecord(
		pasteAction: (record: ClipboardRecord) => void,
		item: MenuItem,
		record: ClipboardRecord,
		label: number
	) {
		const documentFragment = new DocumentFragment();

		const rowDiv = documentFragment.createDiv();
		rowDiv.addClass("pasteFromHistoryViewMenuRecord");

		const labelSpan = rowDiv.createSpan();
		labelSpan.appendText(`${label}: `);
		labelSpan.addClass("pasteFromHistoryViewMenuRecordLabel");

		const textSpan = rowDiv.createSpan();
		textSpan.appendText(record.text.replace(/\n/g, "⏎"));
		textSpan.addClass("pasteFromHistoryViewMenuRecordText");

		item.setTitle(documentFragment);
		item.onClick(() => pasteAction(record));
	}

	private findViableMenuPosition(view: MarkdownView, editor: Editor) {
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
		return position;
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
}
