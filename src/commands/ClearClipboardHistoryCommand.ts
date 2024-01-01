import { Command, Notice } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";

export class ClearClipboardHistoryCommand implements Command {
	id: string = "clear-clipboard-history";
	name: string = "Clear clipboard history";
	icon: string = "clipboard-x";

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	callback() {
		this.clipboardHistoryService.clearRecords();
		new Notice("Clipboard history cleared");
	}
}
