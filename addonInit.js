
/**
 * setupAddon runs when the form editor opens to set up the add-on.
 */
function setupAddon() {
    let ui = FormApp.getUi()
    ui.createMenu('Audition Form Manager')
    .addItem('Getting started', 'showTestSidebar')
    .addItem('Set up form', 'showSetupSidebar')
    .addSeparator()
    .addItem('Check status', 'showStatusSidebar')
    .addItem('Manage part/folder mapping', 'showPartManager')
    .addSeparator()
    .addItem('Discard everything', 'showTestSidebar')
    .addItem('About', 'showAbout')
    .addToUi()
}

function showAbout() {
    let { author, authorContact, version } = PropertiesService.getScriptProperties().getProperties()
    let message = `<p>Audition Form Manager - ${version}.</p><p>Contact ${author} at ${authorContact} for assistance.</p>`
    
    showModalMessage("About",message, 300, 150)
}
  
/**
 * install is used by the website to add the add-on to a form.
 */
function install(form = FormApp.getActiveForm()) {
    uninstall(form)
    ScriptApp.newTrigger('setupAddon')
        .forForm(form)
        .onOpen()
        .create()
}

/**
 * uninstall is used by the website to remove previous versions
 * of the add-on from the form.
 */
function uninstall(form = FormApp.getActiveForm()) {
    let triggers = ScriptApp.getUserTriggers(form)
    triggers.forEach((t) => { ScriptApp.deleteTrigger(t) })
}


