function showPartManager() {   
    let ui = FormApp.getUi()
    let html = HtmlService.createTemplateFromFile("addonParts")
    ui.showModalDialog(html.evaluate(), "Peace")
}