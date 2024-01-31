import { Editor, MarkdownView } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { HistoryViewType } from "src/models/HistoryViewType";

export class HistoryViewDocked implements HistoryView {
	containerElement: HTMLDivElement;
	recordRows: HTMLDivElement[];
	selectedRow: number;
	editor: Editor;
	previewElement?: HTMLElement;

	private keySelectionListener = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			const index = this.calculateSelectedRowIndex(event.key === "ArrowDown");
			this.setSelectedRow(index);
			event.preventDefault();
		} else if (event.key === "Enter") {
			this.recordRows[this.selectedRow].click();
			this.close();
			event.preventDefault();
		} else if (event.key === "Escape") {
			this.close();
			event.preventDefault();
		}
	};

	private focusHasChangedListener = () => this.close();

	constructor(private clipboardHistoryService: ClipboardHistoryService, private previewLines: number) {}

	type = () => HistoryViewType.DOCKED;

	close(focusEditor = true) {
		if (this.containerElement) {
			this.containerElement.detach();
		}
		document.removeEventListener("keydown", this.keySelectionListener);
		document.removeEventListener("focusin", this.focusHasChangedListener);
		if (focusEditor && this.editor) {
			this.editor.focus();
		}
	}

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close(false);
		this.editor = editor;
		this.containerElement = view.containerEl.createDiv();
		this.containerElement.addClass("pasteFromHistoryViewDocked");

		const headingContainer = this.containerElement.createDiv();
		headingContainer.addClass("pasteFromHistoryViewDockedHeading");
		const heading = headingContainer.createSpan();
		heading.appendText("Clipboard History");

		const recordsContainer = this.containerElement.createDiv();
		recordsContainer.addClass("pasteFromHistoryViewDockedRecords");
		const records = this.clipboardHistoryService.getRecords();
		this.recordRows = [];
		for (let index = 0; index < records.length; index++) {
			this.recordRows.push(
				this.createRowForClipboardRecord(pasteAction, recordsContainer, records[index], index)
			);
		}
		if (this.previewLines > 0) {
			const previewContainer = this.containerElement.createDiv();
			previewContainer.addClass("pasteFromHistoryViewDockedPreview");
			this.previewElement = previewContainer.createEl("textarea", <DomElementInfo>{
				attr: { rows: `${this.previewLines}`, disabled: true },
			});
		} else {
			this.previewElement = undefined;
		}

		this.selectedRow = 0;
		this.recordRows[this.selectedRow].addClass("selected");
		this.previewElement?.setText(records[this.selectedRow].text);
		editor.blur();
		document.addEventListener("keydown", this.keySelectionListener);
		document.addEventListener("focusin", this.focusHasChangedListener);
	}

	setPreviewLines(numberOfLines: number) {
		this.previewLines = numberOfLines;
	}

	private createRowForClipboardRecord(
		pasteAction: (record: ClipboardRecord) => void,
		recordsContainer: HTMLDivElement,
		record: ClipboardRecord,
		index: number
	): HTMLDivElement {
		const rowDiv = recordsContainer.createDiv();
		rowDiv.addClass("pasteFromHistoryViewDockedRecord");
		rowDiv.onclick = () => pasteAction(record);
		rowDiv.onmouseover = () => this.setSelectedRow(index);

		const labelSpan = rowDiv.createSpan();
		labelSpan.appendText(`${index + 1}:`);
		labelSpan.addClass("pasteFromHistoryViewDockedRecordLabel");

		const textSpan = rowDiv.createSpan();
		textSpan.appendText(record.text.replace(/\n/g, "⏎"));
		textSpan.addClass("pasteFromHistoryViewDockedRecordText");
		return rowDiv;
	}

	private calculateSelectedRowIndex(increment: boolean): number {
		if (increment) {
			if (this.selectedRow >= this.recordRows.length - 1) {
				return 0;
			} else {
				return Math.min(this.selectedRow + 1, this.recordRows.length - 1);
			}
		} else {
			if (this.selectedRow <= 0) {
				return this.recordRows.length - 1;
			} else {
				return Math.max(this.selectedRow - 1, 0);
			}
		}
	}

	private setSelectedRow(index: number) {
		this.recordRows[this.selectedRow].removeClass("selected");
		this.selectedRow = index;
		this.recordRows[this.selectedRow].addClass("selected");
		const clipboardRecord = this.clipboardHistoryService.getRecord(this.selectedRow);
		this.previewElement?.setText(clipboardRecord.text);
	}
}
