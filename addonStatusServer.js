function showStatusSidebar() {
    var html = HtmlService.createTemplateFromFile('addonStatus');
  
    FormApp.getUi() 
        .showSidebar(html.evaluate().setTitle("Current Status"));
  }

// Display if the form is open
// Display if the form has had the submit trigger installed
// Display if the form has a valid configuration
// Display how many submissions there have been
// Display how many people have filed submissions