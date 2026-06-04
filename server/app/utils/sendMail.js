const transporter = require("../config/emailConfig");



const sendCredentialsEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = {
 
  sendCredentialsEmail,
};