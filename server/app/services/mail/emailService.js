

const nodemailer = require("nodemailer");

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });
};

const wrapInBaseTemplate = (contentHtml) => `
  <div style="background-color: #f9f9f9; padding: 30px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <div style="background-color: #2E8B57; background-image: linear-gradient(135deg, #2E8B57 0%, #9370DB 100%); padding: 25px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
          Green Pulse
        </h1>
      </div>

      <div style="padding: 30px 25px; color: #333333; line-height: 1.6; font-size: 16px;">
        ${contentHtml}
      </div>

      <div style="background-color: #fdfdfd; padding: 15px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
        This is an automated operational transmission from Green Pulse.
      </div>
    </div>
  </div>
`;

// ---- MAIL VERIFY ----
const sendCredentialsEmail = async (email, subject, htmlContent) => {
  const transporter = getTransporter();
  const mailOptions = {
    // Standardized to authenticate with the explicit server sender address variables configuration
    from: `"Green Pulse Authorization" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: wrapInBaseTemplate(htmlContent),
  };
  await transporter.sendMail(mailOptions);
};

// ---- ACCEPT CLEANING REQUEST (Triggered when Company accepts) ---- //
const sendCompanyAcceptedEmail = async (ngoEmail, requestData) => {
  const transporter = getTransporter();

  const locationName = requestData.location || "Your specified location";
  const companyName = requestData.companyId?.companyName || "An authorized cleaning agency";
  const companyPhone = requestData.companyId?.phone || "N/A";

  const acceptHtmlContent = `
    <h2 style="color: #2E8B57; margin-top: 0;">🤝 Sanitation Request Accepted</h2>
    <p>Dear Partner,</p>
    <p>We are pleased to inform you that <strong>${companyName}</strong> has officially accepted your cleaning and sanitation request for <strong>${locationName}</strong>.</p>
    
    <p>Thank you for your dedication to keeping our communities clean and sustainable. Our active field crew is currently preparing to deploy to the site. We will update the system status in real-time as the collection process gets underway.</p>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E8B57;">
      <strong style="color: #555;">Assigned Company Contact Details:</strong><br/>
      <strong>Hotline Connection:</strong> <span style="color: #2E8B57; font-weight: bold;">${companyPhone}</span>
    </div>

    <p style="margin-bottom: 25px;">Thank you once again for your collaboration!</p>
    
    <div style="font-size: 14px; color: #555555; margin-top: 20px;">
      Best regards,<br/>
      <strong>The Green Pulse Logistics Team</strong>
    </div>
  `;

  const mailOptions = {
    // Fixed: Aligned 'from' header with SMTP authentication to prevent spoofing rejection filters
    from: `"Green Pulse Logistics" <${process.env.EMAIL_USER}>`,
    to: ngoEmail,
    subject: `Update: Sanitation Request Accepted for ${locationName}`,
    html: wrapInBaseTemplate(acceptHtmlContent),
  };

  await transporter.sendMail(mailOptions);
};

// ---- COMPLETE CLEANING REQUEST ---- // 
const sendNgoNotificationEmail = async (ngoEmail, requestData) => {
  const transporter = getTransporter();

  // Handle parsing safety check if wasteType is passed as a string array block representation
  let displayWasteType = "mixed";
  if (requestData.wasteType) {
    displayWasteType = Array.isArray(requestData.wasteType) 
      ? requestData.wasteType.join(", ") 
      : String(requestData.wasteType);
  }

  const ngoHtmlContent = `
    <h2 style="color: #2E8B57; margin-top: 0;">♻️ New Recycling & Disposal Task Available</h2>
    <p>Hello Team NGO,</p>
    <p>A cleaning request has been successfully processed by our cleaning partner and is now ready for collection and eco-friendly disposal.</p>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9370DB;">
      <strong style="color: #555;">Task Information:</strong><br/>
      <strong>Location:</strong> ${requestData.location}<br/>
      <strong>Waste Type:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #9370DB;">${displayWasteType}</span><br/>
      <strong>Description:</strong> ${requestData.description || "N/A"}<br/>
      <strong>Cleaned By:</strong> ${requestData.companyId?.companyName || "Assigned Cleaning Company"}
    </div>

    <p style="margin-bottom: 25px;">Please log in to your Green Pulse dashboard to accept this pickup request and claim the routing details.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ngo/dashboard" 
         style="background-color: #2E8B57; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
         View NGO Dashboard
      </a>
    </div>
  `;

  const mailOptions = {
    // Fixed: Aligned 'from' header with SMTP authentication to prevent spoofing rejection filters
    from: `"Green Pulse Operations" <${process.env.EMAIL_USER}>`,
    to: ngoEmail,
    subject: `[Green Pulse] Urgent: ${displayWasteType.toUpperCase()} Waste Collection Ready`,
    html: wrapInBaseTemplate(ngoHtmlContent),
  };

  await transporter.sendMail(mailOptions);
};


// ---- CONTACT US EMAIL ---- //
const sendContactUsEmail = async ({
  name,
  email,
  subject,
  message,
}) => {
  const transporter = getTransporter();

  const contactHtmlContent = `
    <h2 style="color: #2E8B57; margin-top:0;">
      📩 New Contact Form Submission
    </h2>

    <p>A new message has been submitted through the Green Pulse Contact Us page.</p>

    <div style="background:#f5f5f5;padding:15px;border-radius:8px;border-left:4px solid #2E8B57;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>

    <p style="margin-top:20px;">
      Please respond to the sender if required.
    </p>
  `;

  await transporter.sendMail({
    from: `"Green Pulse Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `[Contact Us] ${subject}`,
    html: wrapInBaseTemplate(contactHtmlContent),
  });
};

module.exports = { 
  sendCredentialsEmail, 
  sendCompanyAcceptedEmail, 
  sendNgoNotificationEmail ,
   sendContactUsEmail,
};