import { App, PluginSettingTab, Setting } from "obsidian";
import { ClipboardHistoryPlugin } from "./ClipboardHistoryPlugin";
import { HistoryViewType } from "./models/HistoryViewType";
import { SettingName } from "./models/SettingName";
import { keyOfEnum } from "./utils/EnumUtil";

const HISTORY_LIMIT_MIN = 4;
const HISTORY_LIMIT_MAX = 40;
const HISTORY_LIMIT_STEP = 2;

const SCROLL_THRESHOLD_MIN = 0;
const SCROLL_THRESHOLD_MAX = 20;
const SCROLL_THRESHOLD_STEP = 1;

const PREVIEW_LINES_MIN = 0;
const PREVIEW_LINES_MAX = 20;
const PREVIEW_LINES_STEP = 1;

export class ClipboardHistorySettingTab extends PluginSettingTab {
	plugin: ClipboardHistoryPlugin;
	scrollThresholdSetting?: Setting;
	previewLinesSetting?: Setting;

	constructor(app: App, plugin: ClipboardHistoryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	hide() {
		this.scrollThresholdSetting = undefined;
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
			.setDesc("Upper limit for the amount of tracked clipboard events.")
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
			.setDesc(this.createHistoryViewDescription())
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
							containerEl.lastChild?.detach();
							this.hide();
						}
					})
			);
		if (this.plugin.settings.historyViewType === HistoryViewType.DOCKED) {
			this.addScrollThresholdSetting();
			this.addPreviewLinesSetting();
		}
	}

	private createHistoryViewDescription(): DocumentFragment {
		const documentFragment = new DocumentFragment();
		const ul = documentFragment.createEl("ul");
		ul.createEl("li").setText("Hovered: Floating over the editor.");
		ul.createEl("li").setText("Docked: Docked to the bottom of the editor.");
		return documentFragment;
	}

	private addScrollThresholdSetting() {
		if (!this.scrollThresholdSetting) {
			this.scrollThresholdSetting = new Setting(this.containerEl)
				.setName(SettingName.SCROLL_THRESHOLD)
				.setDesc(
					"Number of visible clipboard items before scrolling. Set to 0 to show all instead of scrolling."
				)
				.addSlider((slider) =>
					slider
						.setLimits(SCROLL_THRESHOLD_MIN, SCROLL_THRESHOLD_MAX, SCROLL_THRESHOLD_STEP)
						.setValue(this.plugin.settings.scrollThreshold)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.scrollThreshold = value;
							await this.plugin.saveSettings(SettingName.SCROLL_THRESHOLD);
						})
				);
		}
	}

	private addPreviewLinesSetting() {
		if (!this.previewLinesSetting) {
			this.previewLinesSetting = new Setting(this.containerEl)
				.setName(SettingName.PREVIEW_LINES)
				.setDesc("Number of lines to reserve for multiline preview. Set to 0 to disable preview.")
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
