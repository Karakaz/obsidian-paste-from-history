import { Editor, MarkdownView } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";
import { ClipboardRecord } from "src/models/ClipboardRecord";
import { HistoryView } from "src/models/HistoryView";
import { HistoryViewType } from "src/models/HistoryViewType";
import { SettingName } from "src/models/SettingName";

export class HistoryViewDocked implements HistoryView {
	doc: Document;
	containerElement: HTMLDivElement;
	recordsContainer: HTMLDivElement;
	recordRows: HTMLDivElement[];
	editor: Editor;
	selectedRow?: number;
	previewElement?: HTMLElement;
	elementAddedObserver?: MutationObserver;

	onBlur = () => this.close();

	constructor(
		private clipboardHistoryService: ClipboardHistoryService,
		private scrollThreshold: number,
		private previewLines: number
	) {}

	type = () => HistoryViewType.DOCKED;

	close(focusEditor = true) {
		if (this.containerElement && this.recordsContainer) {
			this.recordsContainer.removeEventListener("blur", this.onBlur);
			this.containerElement.detach();
		}
		this.recordRows = [];
		this.selectedRow = undefined;
		this.previewElement = undefined;
		this.disposeElementAddedObserver();

		if (focusEditor && this.editor) {
			this.editor.focus();
		}
	}

	disposeElementAddedObserver() {
		if (this.elementAddedObserver) {
			this.elementAddedObserver.disconnect();
			this.elementAddedObserver = undefined;
		}
	}

	open(editor: Editor, view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.close(false);
		this.editor = editor;
		this.doc = view.containerEl.ownerDocument;
		this.createElements(view, pasteAction);

		if (this.clipboardHistoryService.hasRecords()) {
			this.setSelectedRow(0);
		}
	}

	onSettingChanged(setting: SettingName, value: number) {
		switch (setting) {
			case SettingName.PREVIEW_LINES:
				this.previewLines = value;
				break;
			case SettingName.SCROLL_THRESHOLD:
				this.scrollThreshold = value;
				break;
			default:
				break;
		}
	}

	private createElements(view: MarkdownView, pasteAction: (record: ClipboardRecord) => void) {
		this.containerElement = view.containerEl.createDiv();
		this.containerElement.addClass("pasteFromHistoryViewDocked");

		this.createHeadingElement();

		this.createRecordsElements(pasteAction);

		if (this.previewLines > 0) {
			this.createPreviewElement();
		}
	}

	private createHeadingElement() {
		const heading = this.containerElement.createSpan();
		heading.appendText("Clipboard history");
		heading.addClass("pasteFromHistoryViewDockedHeading");
	}

	private createRecordsElements(pasteAction: (record: ClipboardRecord) => void) {
		this.recordsContainer = this.containerElement.createDiv();
		this.recordsContainer.addClass("pasteFromHistoryViewDockedRecords");
		this.recordsContainer.setAttribute("tabindex", "-1");
		this.recordsContainer.addEventListener("blur", this.onBlur);
		this.recordsContainer.addEventListener("keydown", (event: KeyboardEvent) => this.keySelectionListener(event));

		const records = this.clipboardHistoryService.getRecords();
		this.recordRows = [];
		for (let index = 0; index < records.length; index++) {
			this.recordRows.push(
				this.createRowForClipboardRecord(pasteAction, records[index], index)
			);
		}

		this.addElementAddedObserver();
	}

	private keySelectionListener(event: KeyboardEvent): boolean {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			if (this.selectedRow || this.selectedRow === 0) {
				const index = this.calculateSelectedRowIndex(event.key === "ArrowDown");
				this.setSelectedRow(index);
				this.recordRows[index].scrollIntoView();
				event.preventDefault();
			}
			return false;
		} else if (event.key === "Enter" || event.key === " ") {
			this.getSelectedRow()?.click();
			this.close(false);
			event.preventDefault();
			return false;
		} else if (event.key === "Escape") {
			this.close();
			event.preventDefault();
			return false;
		}
		return true;
	}

	private createRowForClipboardRecord(
		pasteAction: (record: ClipboardRecord) => void,
		record: ClipboardRecord,
		index: number
	): HTMLDivElement {
		const rowDiv = this.recordsContainer.createDiv();
		rowDiv.addClass("pasteFromHistoryViewDockedRecord");
		rowDiv.setAttribute("selected", "false");
		rowDiv.addEventListener("click", () => {
			pasteAction(record);
			this.close();
		});
		rowDiv.addEventListener("mousemove", () => {
			if (this.selectedRow !== index) {
				this.setSelectedRow(index);
			}
		});

		const labelSpan = rowDiv.createSpan();
		labelSpan.appendText(`${index + 1}:`);
		labelSpan.addClass("pasteFromHistoryViewDockedRecordLabel");

		const textSpan = rowDiv.createSpan();
		textSpan.appendText(record.text.replace(/\n/g, "⏎"));
		textSpan.addClass("pasteFromHistoryViewDockedRecordText");
		return rowDiv;
	}

	private addElementAddedObserver() {
		this.elementAddedObserver = new MutationObserver(() => {
			if (this.scrollThreshold > 0 && this.doc.body.contains(this.recordRows[0])) {
				const recordPadding = 3;
				const itemHeight = this.recordRows[0].innerHeight + recordPadding;
				const recordsBottomPadding = 8;
				const offsetToRevealNextItem = 4;
				const maxHeight = itemHeight * this.scrollThreshold + recordsBottomPadding + offsetToRevealNextItem;
				this.recordsContainer.style.maxHeight = `${maxHeight}px`;
			}
			if (this.doc.body.contains(this.recordsContainer)) {
				this.recordsContainer.focus();
				this.disposeElementAddedObserver();
			}
		});
		this.elementAddedObserver.observe(this.doc.body, {
			attributes: false,
			childList: true,
			characterData: false,
			subtree: true,
		});
	}

	private createPreviewElement() {
		const previewContainer = this.containerElement.createDiv();
		previewContainer.addClass("pasteFromHistoryViewDockedPreview");
		this.previewElement = previewContainer.createEl("textarea", <DomElementInfo>{
			attr: { rows: `${this.previewLines}`, disabled: true },
		});
	}

	private calculateSelectedRowIndex(increment: boolean): number {
		// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
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
		this.getSelectedRow()?.setAttribute("selected", "false");
		this.selectedRow = index;
		this.recordRows[this.selectedRow].setAttribute("selected", "true");
		const clipboardRecord = this.clipboardHistoryService.getRecord(this.selectedRow);
		this.previewElement?.setText(clipboardRecord.text);
	}

	private getSelectedRow(): HTMLDivElement | undefined {
		if (this.selectedRow || this.selectedRow === 0) {
			return this.recordRows[this.selectedRow];
		}
	}
}
