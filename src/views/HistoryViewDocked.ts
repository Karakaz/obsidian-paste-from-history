import { Editor, MarkdownView } from "obsidian";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { HistoryViewType } from "src/models/HistoryViewType";

export class HistoryViewDocked implements HistoryView {
	docking: HTMLDivElement;

	type() {
		return HistoryViewType.DOCKED;
	}

	close() {
		if (this.docking) {
			this.docking.detach();
		}
	}

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close();
		this.docking = view.containerEl.createDiv();
		this.docking.addClass("historyViewDocking");
		// const recordsContainer = this.docking.createDiv();
		// const previewContainer = this.docking.createDiv();
		this.docking.createSpan().appendText("Yo yo");
	}
}
