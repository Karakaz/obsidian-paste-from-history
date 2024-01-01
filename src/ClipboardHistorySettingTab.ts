import { App, PluginSettingTab, Setting } from "obsidian";
import { ClipboardHistoryPlugin } from "./ClipboardHistoryPlugin";

const RECORD_LIMIT_MIN = 5;
const RECORD_LIMIT_MAX = 50;
const RECORD_LIMIT_STEP = 5;

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
			.setName("Record limit")
			.setDesc("Upper limit for the amount of clipboard records")
			.addSlider((slider) =>
				slider
					.setLimits(RECORD_LIMIT_MIN, RECORD_LIMIT_MAX, RECORD_LIMIT_STEP)
					.setValue(this.plugin.settings.recordLimit)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.recordLimit = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
