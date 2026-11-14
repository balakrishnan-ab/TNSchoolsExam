// =========================================================================
// 100% இலவச GMAIL OTP SENDER (Google Apps Script)
// 1. https://script.google.com திறந்து "New Project" உருவாக்கவும்.
// 2. இந்தக் குறியீட்டை ஒட்டி (Paste) Save செய்யவும்.
// 3. மேல் வலதுபுறம் "Deploy" -> "New deployment" -> Type: "Web app" தேர்ந்தெடுக்கவும்.
//    - Execute as: Me (உங்கள் Gmail)
//    - Who has access: Anyone
// 4. "Deploy" அழுத்தி கிடைக்கும் Web App URL-ஐ நகலெடுத்து config.js-ல் உள்ள
//    GOOGLE_SCRIPT_OTP_URL இடத்தில் ஒட்டவும்!
// =========================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var toEmail = data.email;
    var otp = data.otp;
    var schoolCode = data.schoolCode || "";

    var subject = "தேர்வு அறை மேலாண்மை தளம் - உங்கள் OTP எண்: " + otp;
    var body = "வணக்கம்,\n\n"
      + "TN Schools Exam Seating Management Portal-க்கான உங்கள் 6 இலக்க சரிபார்ப்பு எண் (OTP): " + otp + "\n"
      + (schoolCode ? ("உங்கள் பள்ளி குறியீடு (School Code): " + schoolCode + "\n") : "")
      + "\nஇந்த OTP எண் 10 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்.\n\n"
      + "நன்றி,\nTN Schools Exam Portal";

    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      body: body,
      name: "TN Schools Exam Portal"
    });

    return ContentService
      .createTextOutput(JSON.stringify({ sent: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ sent: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
