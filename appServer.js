// five things - 
//  - if triggered from user action, complete action
//  - read form setup config from properties (common)
//    - use class, scan from retrieved config
//    - (class should also handle persistence)
//  - validate the form's configuration
//    - check presence of folder to collect responses
//  - (when?) automatically add things
//    - name question
//    - solo question (template)
//    - comment question
//    - spreadsheet destination (after file upload, add / move)
//    
//  - get options for form


const PROP_NAME_ID = "afNameId"
const PROP_PART_ID = "afPartId"
const PROP_UPLOAD_ID = "afUploadId"
const PROP_COMMENT_ID = "afCommentId"
const PROP_SUBMISSION_FOLDER_ID = "afSubFolderId"
const PROP_PART_MAP = "afPartMap"

function throwsException(fn) {
    try {
        fn()
        return false
    } catch {
        return true
    }
}

class PartManager {

    /**
    * @param {AuditionForm} auditionForm The Google Drive Folder containing all submissions.
    */
    constructor(auditionForm) {
        this.auditionForm = auditionForm
    }

    /**
     * Takes a part mapping and finds or makes a folder for it.
     * 
     * @param {Object} partMap The part name, or id
     * @param {string} partMap.name The name of the new or existing folder
     * @param {string} partMap.id The id of the existing folder
     * 
     * @returns {{name: string, id: string}} The reconciled part mapping
     */
    reconcilePartMap(partMap) {

        // Case: id is given
        if ( partMap.id !== undefined ) {
            let folder;
            try {
                folder = DriveApp.getFolderById(partMap.id)
            } catch {
                if ( partMap.name !== undefined && partMap.name != "") {
                    folder = this.auditionForm.getSubmissionFolder().createFolder(partMap.name)
                } else {
                    folder = this.auditionForm.getSubmissionFolder().createFolder("Recovered part")
                }
            }

            return {
                "name": folder.getName(),
                "id": folder.getId()
            }
        }

        // Case: id is not given, name is
        if ( partMap.name !== undefined && partMap.name != "") {
            let folder;
            let parentFolder = this.auditionForm.getSubmissionFolder();
            let folderSearch = parentFolder.getFoldersByName(partMap.name)
            if ( folderSearch.hasNext() ) {
                folder = folderSearch.next()
            } else {
                folder = this.auditionForm.getSubmissionFolder().createFolder(partMap.name)
            }

            return {
                "name": folder.getName(),
                "id": folder.getId()
            }
        }

        throw("reconcilePartMap has neither folder id, nor name.")
    }

    /**
     * @returns {[{
     *  name: string
     *  parts: string[]
     *  fileCount: number
     *  isExtra: boolean
     *  isEmpty: boolean
     * }]} 
     */
    getPartFolderInfo() {
       
        // Get folders in submission folder
        let folders = []
        let folderIt = this.auditionForm.getSubmissionFolder().getFolders()

        while( folderIt.hasNext() ) {
            // except for the one with (File responses)
            let folder = folderIt.next();
            if ( folder.getName().includes("(File responses)") ) { continue; }

            folders.push(folder)
        }

        // find folders associated with parts that might have meandered somewhere else
        let folderIds = folders.map(folder => folder.getId())
        let allParts = this.auditionForm.getFlatPartMap()

        let unique = [...new Set(
            allParts.map(x => x.id)
            .filter(x => x !== undefined && x != "")
            .filter(x => !folderIds.includes(x.id)))
        ]
        
        unique.forEach(id => {
            try {
                let folder = DriveApp.getFolderById(id);
                folders.push(folder)
            } catch {}
        })
            
        const countFiles = (folder) => {
            let i = 0;
            let files = folder.getFiles()
            while( files.hasNext() ) {
                i++;
                files.next()
            }
            return i
        }

        return folders.map( folder => {
            let parts = allParts.filter(x => x.id == folder.getId())
            let itemCount = countFiles(folder)
            return {
                name: folder.getName(),
                parts: parts,
                fileCount: itemCount,
                isEmpty: itemCount == 0,
                isExtra: parts.length == 0
            }
        })
    }
}

class AuditionForm {

    get nameId() {
        return Number.parseFloat(this.data[PROP_NAME_ID]);
    }

    set nameId(id) {
        if (id != this.nameId) {
            this.data[PROP_NAME_ID] = id
            this.propstore.setProperty(PROP_NAME_ID, id)
        }
    }

    get partId() {
        return Number.parseFloat(this.data[PROP_PART_ID])
    }

    set partId(id) {
        if (id != this.partId) {
            this.data[PROP_PART_ID] = id
            this.propstore.setProperty(PROP_PART_ID, id)
        }
    }

    get uploadId() {
        return Number.parseFloat(this.data[PROP_UPLOAD_ID])
    }

    set uploadId(id) {
        if (id != this.uploadId) {
            this.data[PROP_UPLOAD_ID] = id
            this.propstore.setProperty(PROP_UPLOAD_ID, id)
        }
    }

    get commentId() {
        return Number.parseFloat(this.data[PROP_COMMENT_ID])
    }

    set commentId(id) {
        if (id != this.commentId) {
            this.data[PROP_COMMENT_ID] = id
            this.propstore.setProperty(PROP_COMMENT_ID, id)
        }
    }

    get submissionFolderId() {
        return this.data[PROP_SUBMISSION_FOLDER_ID]
    }

    getSubmissionFolder() {
        return DriveApp.getFolderById(this.submissionFolderId)
    }

    set submissionFolderId(id) {
        this.data[PROP_SUBMISSION_FOLDER_ID] = id
        this.propstore.setProperty(PROP_SUBMISSION_FOLDER_ID, id)
    }

    /**
     * @param {GoogleAppsScript.Drive.Folder} folder 
     */
    setSubmissionFolder(folder) {
        this.submissionFolderId = folder.getId()
    }

    get partMap() {
        let map = this.data[PROP_PART_MAP];
        if ( map === undefined ) return {};
        return JSON.parse(map);
    }

    /**
     * 
     * @returns {[{ part: string, name: string, id: string }]}
     */
    getFlatPartMap() {
        let x = this.partMap
        return Object.keys(x).map(key => {
            return {
                part: key,
                name: x[key].name,
                id: x[key].id
            }
        })
    }

    set partMap(map) {
        this.data[PROP_PART_MAP] = JSON.stringify(map);
    }

    /**
     * 
     * @param {string} part
     * @returns {Object<string, {name: string, id: string}>}
     */
    getPartMapping(part) {
        let map = this.partMap
        if ( map[part] === undefined ) {
            map[part] = {
                "name":part
            }
            this.partMap = map
        }
        return map[part]
    }

    // change part map to new folder
    // change part map to existing folder
    setPartMapping(part,newName) {
        let map = this.partMap
        map[part] = {
            "name": newName
        }
        this.partMap = map
    }

    removePartMapping(part) {
        let map = this.partMap
        delete map[part]
        this.partMap = map
    }

    getRegisteredItems() {
        return [
            this.nameId,
            this.commentId,
            this.uploadId,
            this.partId
        ].filter(x => x !== undefined)
    }



    /**
     * getPartFolder determines the folder to be returned for a given part name.
     * @param {string} partName 
     */
    getPartFolder(partName) {
        // TO DO: 
        let submissionFolder = this.getSubmissionFolder()
        let folders = submissionFolder.getFoldersByName(partName)
            
        if ( folders.hasNext() ) {
            return folders.next()
        }
          
        return submissionFolder.createFolder(partName)
    }

    /**
     * @param {GoogleAppsScript.Forms.FormResponse} response 
     */
    withResponse(response) {
        return new AuditionFormResponse(this, response)
    }

    isSetupNeeded() {
        return !this.isValid()
          || throwsException( () => this.source.getDestinationId() )
          || !this.hasSubmitInstalled()
    }

    hasSubmitInstalled() {
        return ScriptApp.getUserTriggers(this.source).map(x => x.getHandlerFunction()).includes('sendSoloToFolder')
    }

    isValid() {
        return ! ( this.nameId === undefined
        || this.source.getItemById(this.nameId) == null
        || this.partId === undefined
        || this.source.getItemById(this.partId) == null
        || this.commentId === undefined
        || this.source.getItemById(this.commentId) == null
        || this.uploadId === undefined
        || this.source.getItemById(this.uploadId) == null
        || this.submissionFolderId === undefined
        || throwsException( () => DriveApp.getFolderById(this.submissionFolderId) ) )
    }

    getPartManager() {
        return new PartManager(this)
    }

    constructor(source = FormApp.getActiveForm()) {
        this.source = source
        this.propstore = PropertiesService.getDocumentProperties()
        this.data = this.propstore.getProperties()
    }

}


class AuditionFormResponse {

    getName() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.auditionForm.nameId)
            .getResponse()
    }

    getPart() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.auditionForm.partId)
            .getResponse()
    }

    getUploadId() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.auditionForm.uploadId)
            .getResponse()
    }

    getComment() {
        let comment = this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.auditionForm.commentId)

        if ( comment === undefined ) {
            return null
        } else if ( comment.length == 0 ) {
            return null
        }

        return comment.getResponse()
    }

    getUploadFile() {
        return DriveApp.getFileById(this.getUploadId())
    }

    getPartFolder() {
        return this.auditionForm.getPartFolder(this.getPart())
    }

    get timestamp() {
        return this.response.getTimestamp()
    }

    get id() {
        return this.response.getId()
    }

    getTimesUploaded() {
        if ( this.timesUploaded === undefined ) {
            this.timesUploaded = this.auditionForm.source
                .getResponses()
                .filter( oldResponse => {
                    let fold = this.auditionForm.withResponse(oldResponse)
                    return this.id != fold.id
                    && this.getName() == fold.getName()
                    && this.getPart() == fold.getPart()
                    && this.timestamp > fold.timestamp
                }).length + 1
        }
        return this.timesUploaded
    }

    /**
     * @param {AuditionForm} auditionForm - the source form
     * @param {GoogleAppsScript.Forms.FormResponse} response - the user response
     */
    constructor(auditionForm, response) {
        this.auditionForm = auditionForm
        this.response = response
    }
}

function showModalMessage(title, message, width, height) {
    let template = HtmlService.createTemplateFromFile('addonModal')
    template.message = message
    
    FormApp.getUi().showModalDialog(
        template.evaluate().setWidth(width).setHeight(height),
        title
    )
}