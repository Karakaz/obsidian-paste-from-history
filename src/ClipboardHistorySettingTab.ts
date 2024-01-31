import { App, PluginSettingTab, Setting } from "obsidian";
import { ClipboardHistoryPlugin } from "./ClipboardHistoryPlugin";
import { HistoryViewType } from "./models/HistoryViewType";
import { SettingName } from "./models/SettingName";
import { keyOfEnum } from "./utils/EnumUtil";

const HISTORY_LIMIT_MIN = 4;
const HISTORY_LIMIT_MAX = 40;
const HISTORY_LIMIT_STEP = 2;

const PREVIEW_LINES_MIN = 0;
const PREVIEW_LINES_MAX = 20;
const PREVIEW_LINES_STEP = 1;

export class ClipboardHistorySettingTab extends PluginSettingTab {
	plugin: ClipboardHistoryPlugin;
	previewLinesSetting?: Setting;

	constructor(app: App, plugin: ClipboardHistoryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	hide() {
		this.previewLinesSetting = undefined;
	}

	display() {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).addButton((button) =>
			button
				.setIcon("rotate-ccw")
				.setTooltip("Reset plugin settings to default")
				.onClick(async () => {
					await this.plugin.resetSettingsToDefault();
					this.hide();
					this.display();
				})
		);

		new Setting(containerEl)
			.setName(SettingName.HISTORY_LIMIT)
			.setDesc("Upper limit for the amount of tracked clipboard events")
			.addSlider((slider) =>
				slider
					.setLimits(HISTORY_LIMIT_MIN, HISTORY_LIMIT_MAX, HISTORY_LIMIT_STEP)
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
					.addOption(HistoryViewType.HOVERED, "Hovered")
					.addOption(HistoryViewType.DOCKED, "Docked")
					.setValue(this.plugin.settings.historyViewType)
					.onChange(async (value) => {
						const key = keyOfEnum(HistoryViewType, value);
						const type = HistoryViewType[key as keyof typeof HistoryViewType];
						this.plugin.settings.historyViewType = type;
						await this.plugin.saveSettings(SettingName.HISTORY_VIEW);
						if (type === HistoryViewType.DOCKED) {
							this.addPreviewLinesSetting();
						} else {
							containerEl.lastChild?.detach();
							this.previewLinesSetting = undefined;
						}
					})
			);
		if (this.plugin.settings.historyViewType === HistoryViewType.DOCKED) {
			this.addPreviewLinesSetting();
		}
	}

	private addPreviewLinesSetting() {
		if (!this.previewLinesSetting) {
			this.previewLinesSetting = new Setting(this.containerEl)
				.setName(SettingName.PREVIEW_LINES)
				.setDesc("Number of lines to reserve for multiline preview")
				.addSlider((slider) =>
					slider
						.setLimits(PREVIEW_LINES_MIN, PREVIEW_LINES_MAX, PREVIEW_LINES_STEP)
						.setValue(this.plugin.settings.previewLines)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.previewLines = value;
							await this.plugin.saveSettings(SettingName.PREVIEW_LINES);
						})
				);
		}
	}
}
