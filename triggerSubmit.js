
/**
 * @param {Object} obj - a form submission
 * @param {FormApp.Form} obj.source - the source form
 * @param {FormApp.FormResponse} obj.response - the user response
 */
function sendSoloToFolder({ response, source }) {
    
    // get stored values for form - question mapping
    var auditionForm = new AuditionForm(source)

    // validate
    if ( !auditionForm.validate().isValid ) {
        throw("form is invalid, could not process response")
    }

    var auditionSubmission = auditionForm.withResponse(response)
  
    // determine the submitted song
    var song = auditionSubmission.part

    auditionSubmission.getUploadFile()
        .moveTo(auditionSubmission.getPartFolder())
        .setName(((file) => {
            
            let originalName = file.getName()
            let prefix = auditionSubmission.getName()
            let timesSubmitted = auditionSubmission.getTimesUploaded()
            if ( timesSubmitted > 1 ) {
                prefix += " (submission #" + timesSubmitted + ")"
            }
            prefix += " - "

            if ( originalName.startsWith(prefix) ) {
                return originalName;
            }

            return prefix + originalName;

        })(auditionSubmission.getUploadFile()))
        .setDescription((() => {
            let desc = ["Submitted by " + auditionSubmission.getName()]
            let timesSubmitted = auditionSubmission.getTimesUploaded()
            if ( timesSubmitted > 1 ) {
                desc.push("(submission #" + timesSubmitted + ")")
            } 
            if ( auditionSubmission.getComment() !== null ) {
                desc.push("with comment: " + auditionSubmission.getComment())
            }
            return desc.join(" ")
        })())
  
    // get the song's submission folder
    var songFolder = getOrCreateSongFolder(
      getOrCreateSubmissionFolder(source),
      song
    )
  
    var file = DriveApp.getFileById(getAnswer(response, formData.uploadId))
    file.moveTo(songFolder)
    file.setDescription(makeDescription(response, formData));
  
    // count how many prior submissions there are
    const priorSubmissions = source
      .getResponses()
      .filter(( otherResponse ) => response.getId() != otherResponse.getId() 
        && getAnswer(response, formData.nameId) == getAnswer(otherResponse, formData.nameId)
        && getAnswer(response, formData.soloId) == getAnswer(otherResponse, formData.soloId)
        && response.getTimestamp() > otherResponse.getTimestamp() )
      .length;
  
    // Set file name to <person> (<submitted#>) - <part/solo> <extension>
    let fileName = getAnswer(response, formData.nameId) + " ";
    if ( priorSubmissions > 0 ) {
      let submissions = priorSubmissions + 1
      fileName += "(submission #" + submissions + ") "
    }
    fileName += file.getName()
    file.setName(fileName)
  }