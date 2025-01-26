// For development purposes, this file can be used to hard-code
// and install the add-on into certain forms for testing.

const INIT_TEST_FORM = '11r36EdX8fjtkwl34J_0yqE9iVeASCAOfHxAGIJspv14';
const INIT_TEST_FORM_2 = '1XJNbyAjeMC7XWrBBNWqRTWlAhCDrlL4wklgUUKTQNMo';

/**
 * iterate is used during development to re-install the addon in
 * hard-coded forms
 */
function iterate() {
    install(FormApp.openById(INIT_TEST_FORM));
    install(FormApp.openById(INIT_TEST_FORM_2));
}


/**
 * showTestSidebar is used for development as a placeholder.
 */
function showTestSidebar() {
    var html = HtmlService.createTemplateFromFile('testpage');
    
    var userProps = PropertiesService.getDocumentProperties()
    var views = userProps.getProperty("views") // will be string or null
    userProps.setProperty("views", ++views) // ++ is awesome

    FormApp.getUi() 
    .showSidebar(html.evaluate().setTitle("Work In Progress"));
}