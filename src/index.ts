import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';

import { shareNote } from './features';
import Settings from "./settings";
import { JoplinNote } from './types';

const shareButton = "share-button"

joplin.plugins.register({
	onStart: async function () {
		Settings.init();

		joplin.views.toolbarButtons.create(shareButton, shareButton, ToolbarButtonLocation.EditorToolbar);
		joplin.commands.register({
			name: shareButton,
			label: 'Share on HackMD',
			iconName: 'fa fa-share-alt',

			execute: async () => {
				const note: JoplinNote = await joplin.workspace.selectedNote();
				if (!note) {
					console.warn("Note isn't selected");
					return;
				}

				await shareNote(note)
			},
		});

		await joplin.settings.onChange(() => {
			// nothing (for now)
		});
	},
});