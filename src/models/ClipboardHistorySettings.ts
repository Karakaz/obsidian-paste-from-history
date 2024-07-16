import { HistoryViewType } from "./HistoryViewType";

export interface ClipboardHistorySettings {
	historyLimit: number;
	historyViewType: HistoryViewType;
	scrollThreshold: number;
	previewLines: number;
}
