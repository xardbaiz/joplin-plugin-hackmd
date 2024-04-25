import joplin from 'api';

import * as hmdApi from '../hackmd-api/generated/api';
import { CreateANewNoteRequest } from '../hackmd-api/generated/model/createANewNoteRequest';
import { UpdateANoteSContentRequest } from '../hackmd-api/generated/model/updateANoteSContentRequest';

import Settings from "./settings";
import { JoplinNote, HackMdNote } from './types';



export async function shareNote(note: JoplinNote): Promise<string> {
    const hmdMarkPrefix = "HackMD Note URL";
    let srcNoteBody = note.body

    if (srcNoteBody.includes(hmdMarkPrefix)) {
        const hmdLinkRegex = /http[s]?:\/\/hackmd\.io\/@[^/]+\/([A-Za-z0-9]+)$/is;
        let url = hmdLinkRegex.exec(srcNoteBody)

        let shortExtId = url?.[1]
        if (shortExtId) {
            await updateNote(note, shortExtId)
            joplin.views.dialogs.showMessageBox("Note content has been successfully updated on HackMD. Use the existing link");
            return;
        } else {
            joplin.views.dialogs.showMessageBox("Existing HackMd note link is broken or has been shared via previous version of API, and couldn't be updated."
                + " Please check the footer part of the note for HackMD link, remove it and try to share the note again");
            return;
        }
    }

    let noteContent = await getNoteContent(note)

    // Uploading
    let response = await createNote(noteContent)
    let url = response.publishLink
    console.log("[HackMD] New note url:", url);

    let updatedBody = `${note.body} \n\n ----- \n ${hmdMarkPrefix}: ${url}`;
    await updateJopinNoteBody(note, updatedBody)

    return url
}

async function createNote(noteContent: string): Promise<HackMdNote> {
    console.debug("[HackMD] Creating note...");

    let userNotesApi = await getUserNotesClient()
    let createANewNoteRequest = new CreateANewNoteRequest()
    createANewNoteRequest.content = noteContent
    let response = await userNotesApi.createANewNote(createANewNoteRequest)
    let createdNote: HackMdNote = response.body
    await updatePermissions(createdNote)

    return createdNote
}

async function updatePermissions(hackMdNote: HackMdNote) {
    console.debug("[HackMD] Updating note permissions...");

    let userNotesApi = await getUserNotesClient()
    let request: UpdateANoteSContentRequest = new UpdateANoteSContentRequest()
    request.readPermission = "guest"
    await userNotesApi.updateANoteSContent(hackMdNote.id, request)
}

async function updateNote(source: JoplinNote, externalId: string) {
    console.debug("[HackMD] Updating note...");
    const hmdInfoRegex = /\s[-]{5}\s\nHackMD\sNote\sURL.*/sg;

    let updatedContent = await getNoteContent(source)
    updatedContent = updatedContent.replace(hmdInfoRegex, '').trimEnd()

    let userNotesApi = await getUserNotesClient()
    let request: UpdateANoteSContentRequest = new UpdateANoteSContentRequest()
    request.content = updatedContent
    await userNotesApi.updateANoteSContent(externalId, request)
}

async function getNoteContent(source: JoplinNote): Promise<string> {
    console.debug('[HackMD] Selected note object is:', source);
    
    // Set note name (Title)
    let result: string = source.body;
    if (!result.trim().startsWith("# ")) {
        result = `# ${source.title}\n${result}`;
    }

    // Set tags (if any)
    let tags: Object = await joplin.data.get(['notes', source.id, 'tags']);
    let tagItems = tags?.['items']
    if (tagItems && tagItems.length > 0) {
        let tagsText = "###### tags:";
        tags['items'].forEach(tag => {
            tagsText += ` \`${tag.title}\``;
        });
        result = result.replace(/^(#.*\n)/gm, `$1\n${tagsText}\n\n`);
    }

    return result
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
