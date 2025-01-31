/**
 * showSetupSidebar is used to open the setup sidebar.
 */
function showSetupSidebar() {

  let form = FormApp.getActiveForm()
  let ui = FormApp.getUi()

  if (form.getItems().find(item => item.getType() === FormApp.ItemType.FILE_UPLOAD) === undefined ) {
    let html = HtmlService.createTemplateFromFile('addonFormSetupNoFile');
    ui.showSidebar(html.evaluate().setTitle("Setup"));
    return
  }

  let auditionForm = new AuditionForm(form)

  if ( auditionForm.isSetupNeeded() ) {
    let html = HtmlService.createTemplateFromFile("addonFormSetupModal");
    ui.showModalDialog(html.evaluate().setHeight(150).setWidth(300), "Getting things ready")
    return
  }

  let html = HtmlService.createTemplateFromFile('addonFormSetup');
  ui.showSidebar(html.evaluate().setTitle("Setup"));

}

function setUpForm(form = FormApp.getActiveForm()) {

  // Part 1 - add items

  let items = form.getItems()
  let auditionForm = new AuditionForm(form)

  let getOrCreateItem = (id, searchFilter, createFn) => {
    
    // registered
    if ( id !== undefined && form.getItemById(id) !== null ) {
      return form.getItemById(id)
    }

    // exists, but needs finding
    let candidate = items
      .filter(item => !auditionForm.getRegisteredItems().includes(item.getId()))
      .find(searchFilter)

    if( candidate !== undefined ) {
      return candidate
    }

    // does not exist, needs creating
    return createFn(form)
    
  }

  let nameItem = getOrCreateItem(
    auditionForm.nameId,
    (item) => item.getType() == FormApp.ItemType.TEXT
      && item.getTitle().toLowerCase().includes("name"),
    (form) => form.addTextItem()
        .setRequired(true)
        .setTitle("Your name")
        .setHelpText("Please provide your name.")
    
  )
  form.moveItem(nameItem.getIndex(), 0)
  auditionForm.nameId = nameItem.getId()

  let partItem = getOrCreateItem(
    auditionForm.partId,
    (item) => [FormApp.ItemType.LIST, FormApp.ItemType.MULTIPLE_CHOICE].includes(item.getType())
      && ["choose", "part", "solo"]
        .map(x => item.getTitle().toLowerCase().includes(x))
        .includes(true),
    (form) => form.addMultipleChoiceItem()
        .setRequired(true)
        .setTitle("Choose a part to upload an audition for")
  )

  form.moveItem(partItem.getIndex(), 1)
  auditionForm.partId = partItem.getId()

  let uploadItem = getOrCreateItem(
    auditionForm.uploadId,
    (item) => item.getType() == FormApp.ItemType.FILE_UPLOAD,
    () => {
      throw "Form setup could not find the file upload question"
    }
  )
  uploadItem.setTitle("Upload your audition")
  form.moveItem(uploadItem.getIndex(), 2)
  auditionForm.uploadId = uploadItem.getId()

  let commentItem = getOrCreateItem(
    auditionForm.commentId,
    (item) => item.getType() == FormApp.ItemType.PARAGRAPH_TEXT
      && item.getTitle().toLowerCase().includes("comment"),
    (form) => form.addParagraphTextItem()
        .setRequired(false)
        .setTitle("Add a comment")
        .setHelpText("Optional. This space is provided to add any necessary context to your submission, if needed. Otherwise, it can be left blank.")
  )

  form.moveItem(commentItem.getIndex(), 3)
  auditionForm.commentId = commentItem.getId()

  // Part 2 - Find that response folder
  let expectedTitle = form.getTitle() + " (File responses)"
  let formFolder = (() => {
    let folders = DriveApp.getFoldersByName(expectedTitle)
    if ( !folders.hasNext() ) {
      throw "Could not find file response folder for form"
    }
    return folders.next()
  })()
  auditionForm.setSubmissionFolder(formFolder)

  // Part 3 - Find / make the target spreadsheet and put it in the folder
  let destinationId;

  try {
    destinationId = form.getDestinationId()
  } catch {
    let responseSheet = SpreadsheetApp.create(form.getTitle() + " - Responses")
    destinationId = responseSheet.getId()
    form.setDestination(FormApp.DestinationType.SPREADSHEET, destinationId)
  } finally {
    DriveApp.getFileById(destinationId).moveTo(formFolder)
  }

  // Part 4 - Install the trigger
  if(
    !auditionForm.hasSubmitInstalled()
  ) {
    ScriptApp
      .newTrigger('sendSoloToFolder')
      .forForm(form)
      .onFormSubmit()
      .create()
  }
}


function getSetupStatus() {
  let form = new AuditionForm();

  return {
    "nameId": form.nameId,
    "nameOptions": {
      "d": "4",
      "e": "5"
    }
  }
}

