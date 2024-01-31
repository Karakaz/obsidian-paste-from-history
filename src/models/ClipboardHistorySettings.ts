import { HistoryViewType } from "./HistoryViewType";

export interface ClipboardHistorySettings {
	historyLimit: number;
	historyViewType: HistoryViewType;
	previewLines: number;
}
