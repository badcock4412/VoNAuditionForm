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



class AuditionForm {
    // private instance fields
    #propstore;
    #form;

    constructor() {
        this.#propstore = PropertiesService.getDocumentProperties()
        this.#form = FormApp.getActiveForm()
    }
}