import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import Settings from "./settings";

import HmdAPI from '@hackmd/api' 
import loadedHmdConfig from "./hackmd/config";

const hmdMarkPrefix = "HackMD Note URL";
const shareButton = "share"

let hmdApiClient:HmdAPI ;

joplin.plugins.register({

	onStart: async function() {
		
		Settings.init();

		joplin.commands.register({
			name: shareButton,
			label: 'Share on HackMD',
			iconName: 'fa fa-share-alt',
			execute: async () => {
				const note = await joplin.workspace.selectedNote();
				if (!note) {
					console.warn("Note isn't selected");
					return;
				}

				if (note.body.includes(hmdMarkPrefix)) {
					joplin.views.dialogs.showMessageBox("Note already shared on HackMD, check footer part of your note for HackMD link,"
					+ " or remove that part to share on HackMD again."
					+ " Note updating is expected in the next version of the plugin");
					return;
				}

				console.debug('[HackMD] Selected note object is:', note);

				if (!hmdApiClient) {
					console.debug("[HackMD] Creating new web-client");
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

				// Set note name (Title)
				let remoteBody:string = note.body;
				if (!remoteBody.trim().startsWith("# ")) {
					remoteBody = `# ${note.title}\n${remoteBody}`;
				}

				// Set tags (if any)
				let tags:Object = await joplin.data.get(['notes', note.id, 'tags']);
				if (tags && tags['items'] && tags['items'].length > 0) {
					let tagsText = "###### tags:";
					tags['items'].forEach(tag => {
						tagsText+=` \`${tag.title}\``;
					});
					remoteBody = remoteBody.replace(/^(#.*\n)/gm, `$1\n${tagsText}\n\n`);
				}

				// Uploading
				let url = await hmdApiClient.newNote(remoteBody);
				console.log("[HackMD] New note url:", url);

				// Updating Joplin local note body
				let newBody  = `${note.body} \n\n ----- \n ${hmdMarkPrefix}: ${url}`;
				await joplin.data.put(['notes', note.id], null, { body: newBody});
				await joplin.commands.execute('editor.setText', newBody);
				await joplin.commands.execute('focusElement', 'noteBody');
			},
		});

		joplin.views.toolbarButtons.create(shareButton, shareButton, ToolbarButtonLocation.EditorToolbar);

		await joplin.settings.onChange(() => {
			if (hmdApiClient) {
				console.debug("HackMD settings changed... logged out");
				hmdApiClient.logout();
			}
		});
	},

});
