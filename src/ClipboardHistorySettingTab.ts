import { App, PluginSettingTab, Setting } from "obsidian";
import { ClipboardHistoryPlugin } from "./ClipboardHistoryPlugin";
import { HistoryViewType } from "./models/HistoryViewType";
import { SettingName } from "./models/SettingName";
import { keyOfEnum } from "./utils/EnumUtil";

const RECORD_LIMIT_MIN = 4;
const RECORD_LIMIT_MAX = 40;
const RECORD_LIMIT_STEP = 2;

export class ClipboardHistorySettingTab extends PluginSettingTab {
	plugin: ClipboardHistoryPlugin;

	constructor(app: App, plugin: ClipboardHistoryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(SettingName.HISTORY_LIMIT)
			.setDesc("Upper limit for the amount of tracked clipboard events")
			.addSlider((slider) =>
				slider
					.setLimits(RECORD_LIMIT_MIN, RECORD_LIMIT_MAX, RECORD_LIMIT_STEP)
					.setValue(this.plugin.settings.historyLimit)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.historyLimit = value;
						await this.plugin.saveSettings(SettingName.HISTORY_LIMIT);
					})
			);

		new Setting(containerEl)
			.setName(SettingName.HISTORY_VIEW)
			.setDesc("Clipboard history view modes")
			.addDropdown((dropdown) =>
				dropdown
					.addOption(HistoryViewType.MENU, "Simple Menu")
					.addOption(HistoryViewType.DOCKED, "Docked Preview")
					.setValue(this.plugin.settings.historyViewType)
					.onChange(async (value) => {
						const key = keyOfEnum(HistoryViewType, value);
						const type = HistoryViewType[key as keyof typeof HistoryViewType];
						this.plugin.settings.historyViewType = type;
						await this.plugin.saveSettings(SettingName.HISTORY_VIEW);
					})
			);
	}
}
