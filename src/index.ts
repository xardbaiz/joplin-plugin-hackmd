import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import Settings from "./settings";

import HmdAPI from '@hackmd/api'
import HackMDConfig from "./hackmd/config";

let hmdApiClient;

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
					console.log("Note isn't selected");
					return;
				}

				console.info('Note is:', note);

				if (!hmdApiClient) {
					let loadedHmdConfig = HackMDConfig;
					console.info('Hack MD Config is:', loadedHmdConfig);
					hmdApiClient = new HmdAPI(loadedHmdConfig);
				}
				if (!hmdApiClient.isLogin()) {
					let username = await Settings.getUsername();
					let password = await Settings.getPassword();
					await hmdApiClient.login(username, password);
				}

				console.log("HackMD Profile info", await hmdApiClient.getMe());
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

		// Also update the TOC when the plugin starts
		updateTocView();
	},

});
