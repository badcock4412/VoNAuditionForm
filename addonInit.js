
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
    .addItem('Manage part/folder mapping', 'showTestSidebar')
    .addSeparator()
    .addItem('Discard everything', 'showTestSidebar')
    .addItem('About', 'showAbout')
    .addToUi()
}

function showAbout() {
    FormApp.getUi().alert("Audition Form Manager - v1.0.0.  Contact Ben Adcock benadcock@gmail.com for assistance.")
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


