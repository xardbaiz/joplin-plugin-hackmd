import joplin from 'api';
import { SettingSection, SettingItem, SettingItemType } from 'api/types';

export default class Settings {
    private static sectionName = "HackMD";

    private static settingsItems: Record<string, SettingItem> = {
        "eu.xardbaiz.HackMD.settings.username": {
            type: SettingItemType.String,
            label: "HackMD email",
            value: "somebody@somewhere.org",
            public: true,
            section: Settings.sectionName
        },
        "eu.xardbaiz.HackMD.settings.password": {
            type: SettingItemType.String,
            label: "HackMD password",
            value: "",
            public: true,
            secure: true,
            section: Settings.sectionName
        }
    };

    static async init() {
        await Settings.registerSection();
        await Settings.registerSettings();
    }
    private static async registerSection() {
        await joplin.settings.registerSection("HackMD", {
            label: "HackMD sync",
            name: Settings.sectionName
        });
        console.log("Section registered");
    }

    private static async registerSettings() {
        await joplin.settings.registerSettings(Settings.settingsItems);
        console.log("Settings registered");
    }
}