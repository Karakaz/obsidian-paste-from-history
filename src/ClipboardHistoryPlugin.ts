import { Plugin } from "obsidian";

import { ClipboardHistorySettingTab } from "./ClipboardHistorySettingTab";
import { ClipboardHistoryService } from "./ClipboardHistoryService";
import { PasteFromClipboardHistoryCommand } from "./commands/PasteFromClipboardHistoryCommand";
import { ClearClipboardHistoryCommand } from "./commands/ClearClipboardHistoryCommand";
import { HistoryViewType } from "./models/HistoryViewType";
import { HistoryViewMenu } from "./views/HistoryViewMenu";
import { SettingName } from "./models/SettingName";
import { HistoryView } from "./models/HistoryView";
import { HistoryViewDocked } from "./views/HistoryViewDocked";

interface ClipboardHistorySettings {
	historyLimit: number;
	historyViewType: HistoryViewType;
	previewLines: number;
}

const DEFAULT_SETTINGS: ClipboardHistorySettings = {
	historyLimit: 16,
	historyViewType: HistoryViewType.MENU,
	previewLines: 6,
};

export class ClipboardHistoryPlugin extends Plugin {
	settings: ClipboardHistorySettings;
	clipboardHistoryService: ClipboardHistoryService;
	pasteCommand: PasteFromClipboardHistoryCommand;
	historyView?: HistoryView;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ClipboardHistorySettingTab(this.app, this));
		this.clipboardHistoryService = new ClipboardHistoryService(this.settings.historyLimit);

		this.registerDomEvent(document, "copy", () => this.recordTextFromClipboard());
		this.registerDomEvent(document, "cut", () => this.recordTextFromClipboard());

		this.pasteCommand = new PasteFromClipboardHistoryCommand(this.clipboardHistoryService);
		this.updateHistoryView();
		this.addCommand(this.pasteCommand);
		this.addCommand(new ClearClipboardHistoryCommand(this.clipboardHistoryService));
	}

	async onunload() {
		if (this.historyView) {
			this.historyView.close();
		}
	}

	async resetSettingsToDefault() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS);
		this.clipboardHistoryService.updateRecordLimit(this.settings.historyLimit);
		this.updateHistoryView();
		await this.saveData(this.settings);
	}

	async saveSettings(changedSetting: SettingName) {
		if (changedSetting === SettingName.HISTORY_LIMIT) {
			this.clipboardHistoryService.updateRecordLimit(this.settings.historyLimit);
		} else if (changedSetting === SettingName.HISTORY_VIEW) {
			this.updateHistoryView();
		} else if (changedSetting === SettingName.PREVIEW_LINES) {
			this.historyView?.setPreviewLines(this.settings.previewLines);
		}
		await this.saveData(this.settings);
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

	private updateHistoryView() {
		if (!this.historyView || this.settings.historyViewType !== this.historyView.type()) {
			if (this.historyView) {
				this.historyView.close();
			}
			if (this.settings.historyViewType === HistoryViewType.MENU) {
				this.historyView = new HistoryViewMenu(this.clipboardHistoryService);
			} else if (this.settings.historyViewType === HistoryViewType.DOCKED) {
				this.historyView = new HistoryViewDocked(this.clipboardHistoryService, this.settings.previewLines);
			} else {
				throw new Error(`Unhandled HistoryViewType: ${this.settings.historyViewType}`);
			}
			this.pasteCommand.setHistoryView(this.historyView);
		}
	}
}
