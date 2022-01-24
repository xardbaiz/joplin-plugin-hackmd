import joplin from 'api';
import { SettingStorage, SettingItem, SettingItemType } from 'api/types';

export default class Settings {
    public static readonly usernameField = "username";
    public static readonly passwordField = "password";
    public static readonly imgurClientId = "imgurClientId";
    private static readonly sectionName = "HackMD";

    private static settingsItems: Record<string, SettingItem> = {
        [Settings.usernameField]: {
            type: SettingItemType.String,
            label: "HackMD email",
            value: "",
            public: true,
            section: Settings.sectionName
        },
        [Settings.passwordField]: {
            type: SettingItemType.String,
            label: "HackMD password",
            value: "",
            public: true,
            secure: true,
            storage: SettingStorage.Database,
            section: Settings.sectionName
        },
        [Settings.imgurClientId]: {
            type: SettingItemType.String,
            label: "HackMD imgur Client-ID",
            // HackMD default imgur Client-ID = c4a98c9f6229a48
            value: "c4a98c9f6229a48",
            public: false,
            secure: true,
            storage: SettingStorage.Database,
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

    public static async getUsername () {
        return await joplin.settings.value(Settings.usernameField);
    }
    public static async getPassword() {
        return await joplin.settings.value(Settings.passwordField);
    }
    public static async getImgurClientId() {
        return await joplin.settings.value(Settings.imgurClientId);
    }
}