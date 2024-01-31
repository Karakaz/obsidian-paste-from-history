import { Editor, MarkdownView } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { HistoryViewType } from "src/models/HistoryViewType";

export class HistoryViewDocked implements HistoryView {
	containerElement: HTMLDivElement;
	recordRows: HTMLDivElement[];
	editor: Editor;
	selectedRow?: number;
	previewElement?: HTMLElement;

	private keySelectionListener = (event: KeyboardEvent) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			if (this.selectedRow || this.selectedRow === 0) {
				const index = this.calculateSelectedRowIndex(event.key === "ArrowDown");
				this.setSelectedRow(index);
			}
			event.preventDefault();
		} else if (event.key === "Enter") {
			this.getSelectedRow()?.click();
			this.close(false);
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
		this.selectedRow = undefined;
		this.previewElement = undefined;

		document.removeEventListener("keydown", this.keySelectionListener);
		document.removeEventListener("focusin", this.focusHasChangedListener);

		if (focusEditor && this.editor) {
			this.editor.focus();
		}
	}

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close(false);
		this.editor = editor;

		this.createElements(view, pasteAction);

		if (this.clipboardHistoryService.hasRecords()) {
			this.setSelectedRow(0);
		}
		editor.blur();
		document.addEventListener("keydown", this.keySelectionListener);
		document.addEventListener("focusin", this.focusHasChangedListener);
	}

	setPreviewLines(numberOfLines: number) {
		this.previewLines = numberOfLines;
	}

	private createElements(view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
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
		}
	}

	private createRowForClipboardRecord(
		pasteAction: (record: ClipboardRecord) => void,
		recordsContainer: HTMLDivElement,
		record: ClipboardRecord,
		index: number
	): HTMLDivElement {
		const rowDiv = recordsContainer.createDiv();
		rowDiv.addClass("pasteFromHistoryViewDockedRecord");
		rowDiv.onclick = () => {
			pasteAction(record);
			this.editor.focus();
		};
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
		const currentSelected = this.selectedRow!;
		if (increment) {
			if (currentSelected >= this.recordRows.length - 1) {
				return 0;
			} else {
				return Math.min(currentSelected + 1, this.recordRows.length - 1);
			}
		} else {
			if (currentSelected <= 0) {
				return this.recordRows.length - 1;
			} else {
				return Math.max(currentSelected - 1, 0);
			}
		}
	}

	private setSelectedRow(index: number) {
		this.getSelectedRow()?.removeClass("selected");
		this.selectedRow = index;
		this.recordRows[this.selectedRow].addClass("selected");
		const clipboardRecord = this.clipboardHistoryService.getRecord(this.selectedRow);
		this.previewElement?.setText(clipboardRecord.text);
	}

	private getSelectedRow(): HTMLDivElement | undefined {
		if (this.selectedRow || this.selectedRow === 0) {
			return this.recordRows[this.selectedRow];
		}
	}
}
