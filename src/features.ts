import joplin from 'api';

import * as hmdApi from '../hackmd-api/generated/api';
import { CreateANewNoteRequest } from '../hackmd-api/generated/model/createANewNoteRequest';
import { UpdateANoteSContentRequest } from '../hackmd-api/generated/model/updateANoteSContentRequest';

import Settings from "./settings";
import { JoplinNote, HackMdNote } from './types';

export async function shareNote(note: JoplinNote): Promise<string> {
    const hmdMarkPrefix = "HackMD Note URL";

    if (note.body.includes(hmdMarkPrefix)) {
        joplin.views.dialogs.showMessageBox("Note already shared on HackMD, check footer part of your note for HackMD link,"
            + " or remove that part to share on HackMD again."
            + " Note updating is expected in the next version of the plugin");
        return;
    }

    console.debug('[HackMD] Selected note object is:', note);
    console.debug("[HackMD] Creating note...");
    // Set note name (Title)
    let remoteBody: string = note.body;
    if (!remoteBody.trim().startsWith("# ")) {
        remoteBody = `# ${note.title}\n${remoteBody}`;
    }

    // Set tags (if any)
    let tags: Object = await joplin.data.get(['notes', note.id, 'tags']);
    let tagItems = tags?.['items']
    if (tagItems && tagItems.length > 0) {
        let tagsText = "###### tags:";
        tags['items'].forEach(tag => {
            tagsText += ` \`${tag.title}\``;
        });
        remoteBody = remoteBody.replace(/^(#.*\n)/gm, `$1\n${tagsText}\n\n`);
    }

    // Uploading
    let response = await uploadNote(remoteBody)
    let url = response.publishLink
    console.log("[HackMD] New note url:", url);

    let updatedBody = `${note.body} \n\n ----- \n ${hmdMarkPrefix}: ${url}`;
    await updateJopinNoteBody(note, updatedBody)

    return url
}

async function uploadNote(remoteBody: string): Promise<HackMdNote> {
    let createANewNoteRequest = new CreateANewNoteRequest()
    createANewNoteRequest.content = remoteBody

    let userNotesApi = await getUserNotesClient()
    let response = await userNotesApi.createANewNote(createANewNoteRequest)
    let createdNote: HackMdNote = response.body
    await updatePermissions(createdNote)

    return createdNote
}

async function updatePermissions(hackMdNote: HackMdNote) {
    let request: UpdateANoteSContentRequest = new UpdateANoteSContentRequest()
    request.readPermission = "guest"

    let userNotesApi = await getUserNotesClient()
    await userNotesApi.updateANoteSContent(hackMdNote.id, request)
}

async function getUserNotesClient(): Promise<hmdApi.UserNotesApi> {
    let userNotesApi = new hmdApi.UserNotesApi()
    userNotesApi.accessToken = await getUserAccessToken()
    return userNotesApi
}

async function getUserAccessToken(): Promise<string> {
    let userAccessToken: string = await Settings.getUserAccessToken()
    if (!userAccessToken) {
        let errMsg = "HackMD user acces token is empty! Check HackMD settings"
        joplin.views.dialogs.showMessageBox(errMsg)
        throw new Error(errMsg)
    }

    return userAccessToken
}

/** Updates Joplin local note body */
async function updateJopinNoteBody(note: JoplinNote, updatedBody: string) {
    await joplin.data.put(['notes', note.id], null, { body: updatedBody });
    await joplin.commands.execute('editor.setText', updatedBody);
    await joplin.commands.execute('focusElement', 'noteBody');
}