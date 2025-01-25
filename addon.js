function setupAddon() {
  let ui = FormApp.getUi()
  ui.createMenu('Audition Form Manager')
  .addItem('Set up form', 'showSidebar')
  .addItem('Check status', 'showSidebar')
  .addItem('Fix renamed solo', 'showSidebar')
  .addToUi()
}

function checkFunction() {
  FormApp.getUi().alert("Hello World!")
}

function showSidebar() {
  var html = HtmlService.createTemplateFromFile('page');

  var userProps = PropertiesService.getDocumentProperties()
  var views = userProps.getProperty("views") // will be string or null
  userProps.setProperty("views", ++views) // ++ is awesome
  
  FormApp.getUi() 
      .showSidebar(html.evaluate().setTitle("Audition Form"));
}

function install(form = FormApp.getActiveForm()) {
  uninstall(form)
  ScriptApp.newTrigger('setupAddon').forForm(form).onOpen().create()
}

function uninstall(form = FormApp.getActiveForm()) {
  let triggers = ScriptApp.getUserTriggers(form)
  triggers.forEach((t) => { ScriptApp.deleteTrigger(t) })
}
