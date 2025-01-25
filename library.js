/**
 * Retrieve the name and id of all forms in a user's drive.
 */
function getAllUserForms(){
    var formList = [];
     var allForms = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
     while(allForms.hasNext()){
       var form = allForms.next();
       formList.push({
         "name":form.getName(),
         "id":form.getId()
       });
   }
   return formList;
}

/**
 * Add a question asking for the respondent's name
 * @param {FormApp.Form} form
 */
function addNameQuestion(form = FormApp.getActiveForm()) {
  var item = form.addTextItem()
    .setRequired(true)
    .setTitle("Your name")
    .setDescription("Please enter your name")
  
  form.moveItem(item.getIndex(), 0)
}
