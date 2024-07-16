import { Editor, MarkdownView } from "obsidian";
import { ClipboardRecord } from "./ClipboardRecord";
import { HistoryViewType } from "./HistoryViewType";
import { SettingName } from "./SettingName";

export interface HistoryView {
	type(): HistoryViewType;
	close(): void;
	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void): void;
	onSettingChanged(setting: SettingName, value: number): void;
}
