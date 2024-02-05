import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  const { deviceName, message } = req.body;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const content = {
    to: process.env.EMAIL_TO, // Recipient's email address
    from: process.env.SENDGRID_EMAIL, // The email address verified with SendGrid
    subject: `Alert from ${deviceName}`,
    text: message,
  };

  try {
    await sgMail.send(content);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email not sent', error);
    res.status(500).json({ error: 'Error sending email' });
  }
};
