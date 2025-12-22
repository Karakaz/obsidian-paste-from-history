import { Plugin } from "obsidian";

import { ClipboardHistorySettingTab } from "./ClipboardHistorySettingTab";
import { ClipboardHistoryService } from "./ClipboardHistoryService";
import { PasteFromClipboardHistoryCommand } from "./commands/PasteFromClipboardHistoryCommand";
import { ClearClipboardHistoryCommand } from "./commands/ClearClipboardHistoryCommand";
import { HistoryViewType } from "./models/HistoryViewType";
import { HistoryViewHovered } from "./views/HistoryViewHovered";
import { SettingName } from "./models/SettingName";
import { HistoryView } from "./models/HistoryView";
import { HistoryViewDocked } from "./views/HistoryViewDocked";
import { ClipboardHistorySettings } from "./models/ClipboardHistorySettings";

const DEFAULT_SETTINGS: ClipboardHistorySettings = {
	historyLimit: 20,
	historyViewType: HistoryViewType.DOCKED,
	scrollThreshold: 10,
	previewLines: 6,
} as const;

export class ClipboardHistoryPlugin extends Plugin {
	settings: ClipboardHistorySettings;
	clipboardHistoryService: ClipboardHistoryService;
	pasteCommand: PasteFromClipboardHistoryCommand;
	historyView: HistoryView;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ClipboardHistorySettingTab(this.app, this));
		this.clipboardHistoryService = new ClipboardHistoryService(this.settings.historyLimit);
		this.registerClipboardCopyCutEventListeners();
		this.registerCommands();
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
		} else if (changedSetting === SettingName.SCROLL_THRESHOLD) {
			this.historyView.onSettingChanged(SettingName.SCROLL_THRESHOLD, this.settings.scrollThreshold);
		} else if (changedSetting === SettingName.PREVIEW_LINES) {
			this.historyView.onSettingChanged(SettingName.PREVIEW_LINES, this.settings.previewLines);
		}
		await this.saveData(this.settings);
	}

	private async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	private registerClipboardCopyCutEventListeners() {
		const recordTextFromClipboard = async (clipboardEvent: ClipboardEvent) => {
			const text = clipboardEvent.clipboardData?.getData("text/plain");
			if (text) {
				this.clipboardHistoryService.putRecord({ text });
			}
		};

		this.registerDomEvent(document, "copy", recordTextFromClipboard);
		this.registerDomEvent(document, "cut", recordTextFromClipboard);
	}

	private registerCommands() {
		this.pasteCommand = new PasteFromClipboardHistoryCommand(this.clipboardHistoryService);
		this.updateHistoryView();
		this.addCommand(this.pasteCommand);
		this.addCommand(new ClearClipboardHistoryCommand(this.clipboardHistoryService));
	}

	private updateHistoryView() {
		if (!this.historyView || this.settings.historyViewType !== this.historyView.type()) {
			if (this.historyView) {
				this.historyView.close();
			}
			if (this.settings.historyViewType === HistoryViewType.HOVERED) {
				this.historyView = new HistoryViewHovered(this.clipboardHistoryService);
			} else if (this.settings.historyViewType === HistoryViewType.DOCKED) {
				this.historyView = new HistoryViewDocked(
					this.clipboardHistoryService,
					this.settings.scrollThreshold,
					this.settings.previewLines
				);
			} else {
				throw new Error(`Unhandled HistoryViewType: ${this.settings.historyViewType}`);
			}
			this.pasteCommand.setHistoryView(this.historyView);
		}
	}
}
