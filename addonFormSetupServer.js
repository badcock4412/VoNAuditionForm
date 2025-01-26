/**
 * showSetupSidebar is used 
 */
function showSetupSidebar() {
  var html = HtmlService.createTemplateFromFile('addonFormSetup');

  FormApp.getUi() 
      .showSidebar(html.evaluate().setTitle("Set-up"));
}

/**
 * Add a question asking for the respondent's name
 * @param {FormApp.Form} form
 */
function addNameQuestion(form = FormApp.getActiveForm()) {
  var item = form.addTextItem()
    .setRequired(true)
    .setTitle("Your name")
    .setHelpText("Please enter your name")
  
  form.moveItem(item.getIndex(), 0)
}


