import { Plugin } from "obsidian";

import { ClipboardHistorySettingTab } from "./ClipboardHistorySettingTab";
import { ClipboardHistoryService } from "./ClipboardHistoryService";
import { PasteFromClipboardHistoryCommand } from "./commands/PasteFromClipboardHistoryCommand";
import { ClearClipboardHistoryCommand } from "./commands/ClearClipboardHistoryCommand";

interface ClipboardHistorySettings {
	historyLimit: number;
}

const DEFAULT_SETTINGS: ClipboardHistorySettings = {
	historyLimit: 20,
};

export class ClipboardHistoryPlugin extends Plugin {
	settings: ClipboardHistorySettings;
	clipboardHistoryService: ClipboardHistoryService;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ClipboardHistorySettingTab(this.app, this));
		this.clipboardHistoryService = new ClipboardHistoryService(this.settings.historyLimit);

		this.registerDomEvent(document, "copy", () => this.recordTextFromClipboard());
		this.registerDomEvent(document, "cut", () => this.recordTextFromClipboard());

		this.addCommand(new PasteFromClipboardHistoryCommand(this.clipboardHistoryService));
		this.addCommand(new ClearClipboardHistoryCommand(this.clipboardHistoryService));
	}

	async saveSettings() {
		await this.saveData(this.settings);
        this.clipboardHistoryService.updateRecordLimit(this.settings.historyLimit);
	}

	private async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	private recordTextFromClipboard() {
		navigator.clipboard.readText().then((text) => {
			if (text) {
				this.clipboardHistoryService.putRecord({ text: text });
			}
		});
	}
}
