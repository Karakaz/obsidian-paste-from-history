import { Editor, MarkdownView } from "obsidian";
import { ClipboardRecord } from "./ClipboardRecord";
import { HistoryViewType } from "./HistoryViewType";

export interface HistoryView {
	type(): HistoryViewType;
	close(): void;
	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void): void;
	setPreviewLines(numberOfLines: number): void;
}
