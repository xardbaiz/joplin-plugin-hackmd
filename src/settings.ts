import joplin from 'api';
import { SettingItem, SettingItemType, SettingStorage } from 'api/types';

export default class Settings {
    private static readonly sectionName = "HackMD";

    public static readonly userAccessTokenField = "accessToken";
    
    private static settingsItems: Record<string, SettingItem> = {
        [Settings.userAccessTokenField]: {
            type: SettingItemType.String,
            label: "HackMD User Access Token",
            value: "",
            public: true,
            section: Settings.sectionName
        }
    };

    static async init() {
        await Settings.registerSection();
        Settings.registerSettings();
    }

    private static async registerSection() {
        await joplin.settings.registerSection("HackMD", {
            label: "HackMD sync",
            name: Settings.sectionName
        });
        console.debug("Settings section registered");
    }

    private static async registerSettings() {
        await joplin.settings.registerSettings(Settings.settingsItems);
        console.debug("Settings registered");
    }
    public static async getUserAccessToken() {
        return await joplin.settings.value(Settings.userAccessTokenField);
    }
}