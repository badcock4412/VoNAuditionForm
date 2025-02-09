
/**
 * @param {Object} obj - a form submission
 * @param {FormApp.Form} obj.source - the source form
 * @param {FormApp.FormResponse} obj.response - the user response
 */
function sendSoloToFolder({ response, source }) {
    
    // get stored values for form - question mapping
    var auditionForm = new AuditionForm(source)

    // validate
    if ( !auditionForm.isValid() ) {
        throw("form is invalid, could not process response")
    }

    var auditionSubmission = auditionForm.withResponse(response)

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
  }