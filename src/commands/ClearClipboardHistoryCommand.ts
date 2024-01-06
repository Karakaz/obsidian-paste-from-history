import { Command, Notice } from "obsidian";
import { ClipboardHistoryService } from "src/ClipboardHistoryService";

export class ClearClipboardHistoryCommand implements Command {
	id = "clear-clipboard-history";
	name = "Clear clipboard history";
	icon = "clipboard-x";

	constructor(private clipboardHistoryService: ClipboardHistoryService) {}

	callback() {
		this.clipboardHistoryService.clearRecords();
		new Notice("Clipboard history cleared");
	}
}
