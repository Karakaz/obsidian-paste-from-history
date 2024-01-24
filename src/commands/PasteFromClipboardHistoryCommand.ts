import { Command, Editor, IconName, MarkdownView } from "obsidian";

import { ClipboardHistoryService } from "../ClipboardHistoryService";
import { ClipboardRecord } from "../models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";

export class PasteFromClipboardHistoryCommand implements Command {
	id = "paste-from-clipboard-history";
	name = "Paste from clipboard history";
	icon: IconName = "clipboard-list";

	private historyView: HistoryView;

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	editorCallback(editor: Editor, view: MarkdownView) {
		this.historyView.open(editor, view, (record: ClipboardRecord) => this.pasteRecordIntoEditor(editor, record));
	}

	setHistoryView(historyView: HistoryView) {
		this.historyView = historyView;
	}

	private pasteRecordIntoEditor(editor: Editor, record: ClipboardRecord) {
		editor.replaceSelection(record.text);
		this.clipboardHistoryService.refreshRecord(record);
		navigator.clipboard.writeText(record.text);
	}
}
