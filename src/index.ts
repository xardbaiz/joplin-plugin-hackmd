import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import Settings from "./settings";

import HmdAPI from '@hackmd/api' 
import HackMDConfig from "./hackmd/config";

let hmdApiClient:HmdAPI ;

joplin.plugins.register({

	onStart: async function() {
		
		Settings.init();

		joplin.commands.register({
			name: 'share',
			label: 'Share on HackMD',
			iconName: 'fas fa-music',
			execute: async () => {
				const note = await joplin.workspace.selectedNote();
				if (!note) {
					console.warn("Note isn't selected");
					return;
				}

				console.debug('[HackMD] Selected note object is:', note);
				let noteBody = note.body;

				if (!hmdApiClient) {
					console.debug("[HackMD] Creating new web-client");
					let loadedHmdConfig = HackMDConfig;
					hmdApiClient = new HmdAPI(loadedHmdConfig);
				}
				let isLogin = await hmdApiClient.isLogin();
				if (!isLogin) {
					console.debug("[HackMD] Checking data for sign in...");
					let username:string = await Settings.getUsername();
					let password:string = await Settings.getPassword();
					console.log(`${username},${password}`);
					if (!username || !password ) {
						joplin.views.dialogs.showMessageBox("HackMD username or password is empty! Check HackMD settings")
						return;
					}
					console.debug("[HackMD] Signing in...");
					await hmdApiClient.login(username, password);
				}

				console.debug("[HackMD] Creating note...");
				let url = await hmdApiClient.newNote(noteBody);

				console.log("[HackMD] New note url:", url);
				await joplin.data.put(['notes', note.id], null, { body: `${noteBody} \n\n ----- \n HackMD Note URL: ${url}` });
				
			},
		});
		
		joplin.views.toolbarButtons.create('share', `share`, ToolbarButtonLocation.EditorToolbar);

		// Later, this is where you'll want to update the TOC
		async function updateTocView() {
			// Get the current note from the workspace.
			/*const note = await joplin.workspace.selectedNote();

			// Keep in mind that it can be `null` if nothing is currently selected!
			if (note) {
				console.info('Note content has changed! New note is:', note);
			}*/
		}

		// This event will be triggered when the user selects a different note
		await joplin.workspace.onNoteSelectionChange(() => {
			updateTocView();
		});

		// This event will be triggered when the content of the note changes
		// as you also want to update the TOC in this case.
		await joplin.workspace.onNoteChange(() => {
			updateTocView();
		});

		await joplin.settings.onChange(() => {
			if (hmdApiClient) {
				console.debug("HackMD settings changed... logged out");
				hmdApiClient.logout();
			}
		});

		// Also update the TOC when the plugin starts
		updateTocView();
	},

});
