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
        return new AuditionFormResponse(this.form, response)
    }

    isSetupNeeded() {
        let throwsException = (fn) => {
            try {
                fn()
                return false
            } catch {
                return true
            }
        }

        return this.nameId === undefined
          || this.form.getItemById(this.nameId) == null
          || this.partId === undefined
          || this.form.getItemById(this.partId) == null
          || this.commentId === undefined
          || this.form.getItemById(this.commentId) == null
          || this.uploadId === undefined
          || this.form.getItemById(this.uploadId) == null
          || this.submissionFolderId === undefined
          || throwsException( () => DriveApp.getFolderById(this.submissionFolderId) )
          || throwsException( () => this.form.getDestinationId() )
    }

    validate() {
        return {
            "isValid": true
        }
    }

    constructor(form = FormApp.getActiveForm()) {
        this.propstore = PropertiesService.getDocumentProperties()
        this.form = form
        this.data = this.propstore.getProperties()
    }

}


class AuditionFormResponse {

    getName() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.form.nameId)
            .getResponse()
    }

    getPart() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.form.partId)
            .getResponse()
    }

    getUploadId() {
        return this.response
            .getItemResponses()
            .find((x) => x.getItem().getId() === this.form.uploadId)
            .getResponse()
    }

    getComment() {
        let comment = this.response
            .getItemResponses()
            find((x) => x.getItem().getId() === this.form.commentId)

        if ( comment === undefined ) {
            return null
        } else if (comment.length == 0 ) {
            return null
        }

        return comment.getResponse()
    }

    getUploadFile() {
        return DriveApp.getFileById(getUploadId())
    }

    getPartFolder() {
        return getPartFolder(this.getPart())
    }

    get timestamp() {
        return this.response.getTimestamp()
    }

    get id() {
        return this.response.getId()
    }

    getTimesUploaded() {
        if ( this.timesUploaded === undefined ) {
            this.timesUploaded = this.form.form
                .getResponses()
                .filter( oldResponse => {
                    let fold = this.form.withResponse(oldResponse)
                    return this.id != fold.id
                    && this.getName() == fold.getName()
                    && this.getPart() == fold.getPart()
                    && this.timestamp > fold.timestamp
                }).length + 1
        }
        return this.timesUploaded
    }

    /**
     * @param {AuditionForm} form - the source form
     * @param {GoogleAppsScript.Forms.FormResponse} response - the user response
     */
    constuctor(form, response) {
        this.form = form
        this.response = response
    }
}