import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import Settings from "./settings";

joplin.plugins.register({

	onStart: async function() {

		await Settings.init();

		await joplin.commands.register({
			name: 'share',
			label: 'Share on HackMD',
			iconName: 'fas fa-music',
			execute: async () => {
				alert('Testing plugin command 1');
			},
		});
		const button = await joplin.views.toolbarButtons.create('share', `share`, ToolbarButtonLocation.EditorToolbar);

		// Later, this is where you'll want to update the TOC
		async function updateTocView() {
			// Get the current note from the workspace.
			const note = await joplin.workspace.selectedNote();

			// Keep in mind that it can be `null` if nothing is currently selected!
			if (note) {
				// console.info('Note content has changed! New note is:', note);
			} else {
				// console.info('No note is selected');
			}
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
