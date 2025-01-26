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


