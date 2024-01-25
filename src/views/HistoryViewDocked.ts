import { App, Editor, MarkdownView } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { HistoryViewType } from "src/models/HistoryViewType";

export class HistoryViewDocked implements HistoryView {
	docking: HTMLDivElement;
	recordRows: HTMLDivElement[];
	selectedRow: number;

	constructor(private clipboardHistoryService: ClipboardHistoryService, private app: App) {}

	type() {
		return HistoryViewType.DOCKED;
	}

	close() {
		if (this.docking) {
			this.docking.detach();
		}
		document.removeEventListener("keydown", this.selectionListener);
	}

	selectionListener = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			this.recordRows[this.selectedRow].removeClass("selected");
			if (event.key === "ArrowDown") {
				this.selectedRow = Math.min(this.selectedRow + 1, this.recordRows.length - 1);
			} else {
				this.selectedRow = Math.max(this.selectedRow - 1, 0);
			}
			this.recordRows[this.selectedRow].addClass("selected");
			event.preventDefault();
			console.log("selectedRow: " + this.selectedRow);
		}
		if (event.key === "Enter") {
			this.recordRows[this.selectedRow].click();
			this.close();
			event.preventDefault();
		} else if (event.key === "Escape") {
			this.close();
			event.preventDefault();
		}
	};

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close();
		this.docking = view.containerEl.createDiv();
		this.docking.addClass("pasteFromHistoryViewDocked");

		const headingContainer = this.docking.createDiv();
		headingContainer.addClass("pasteFromHistoryViewDockedHeading");
		const heading = headingContainer.createSpan();
		heading.appendText("Clipboard History");

		const recordsContainer = this.docking.createDiv();
		recordsContainer.addClass("pasteFromHistoryViewDockedRecords");
		const records = this.clipboardHistoryService.getRecords();
		this.recordRows = [];
		for (let index = 0; index < records.length; index++) {
			this.recordRows.push(
				this.createRowForClipboardRecord(pasteAction, recordsContainer, records[index], index + 1)
			);
		}

		// const previewContainer = this.docking.createDiv();
		this.docking.createSpan().appendText("Yo yo");

		this.selectedRow = 0;
		this.recordRows[this.selectedRow].addClass("selected");
		document.addEventListener("keydown", this.selectionListener);
	}

	createRowForClipboardRecord(
		pasteAction: (record: ClipboardRecord) => void,
		recordsContainer: HTMLDivElement,
		record: ClipboardRecord,
		label: number
	): HTMLDivElement {
		const rowDiv = recordsContainer.createDiv();
		rowDiv.addClass("pasteFromHistoryViewDockedRecord");
		rowDiv.onclick = () => pasteAction(record);

		const labelSpan = rowDiv.createSpan();
		labelSpan.appendText(`${label}:`);
		labelSpan.addClass("pasteFromHistoryViewDockedRecordLabel");

		const textSpan = rowDiv.createSpan();
		textSpan.appendText(record.text.replace(/\n/g, "⏎"));
		textSpan.addClass("pasteFromHistoryViewDockedRecordText");
		return rowDiv;
	}
}
