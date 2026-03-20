require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendRegistrationEmail = async (to, name) => {
  const subject = 'Welcome to Backend Ledger - Your Account Is Ready';
  const appName = 'Backend Ledger';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
  const dashboardUrl = process.env.FRONTEND_URL || '#';

  const text = `Hi ${name},\n\nWelcome to ${appName}! Your account has been created successfully.\n\nYou can now sign in and start managing your transactions securely.\n\nDashboard: ${dashboardUrl}\nSupport: ${supportEmail}\n\nBest regards,\nThe ${appName} Team`;

  const html = `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>Welcome to ${appName}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f4f7fb;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #14213d;
        }
        .wrapper {
          width: 100%;
          background: radial-gradient(circle at 10% 10%, #e9f2ff 0%, #f4f7fb 45%, #eef3ff 100%);
          padding: 28px 12px;
        }
        .email-card {
          max-width: 640px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 16px 50px rgba(20, 33, 61, 0.12);
        }
        .hero {
          background: linear-gradient(125deg, #1d3557 0%, #244f85 45%, #2b6cb0 100%);
          padding: 34px 32px;
          color: #ffffff;
        }
        .brand {
          font-size: 13px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          font-weight: 700;
          opacity: 0.92;
          margin-bottom: 14px;
        }
        .hero-title {
          margin: 0;
          font-size: 30px;
          line-height: 1.25;
          font-weight: 800;
        }
        .hero-subtitle {
          margin: 12px 0 0;
          font-size: 16px;
          line-height: 1.6;
          color: #e9f1ff;
        }
        .content {
          padding: 34px 32px 26px;
        }
        .greeting {
          margin: 0;
          font-size: 20px;
          line-height: 1.4;
          font-weight: 700;
          color: #0f172a;
        }
        .paragraph {
          margin: 16px 0 0;
          font-size: 15px;
          line-height: 1.75;
          color: #334155;
        }
        .cta-wrap {
          margin: 28px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          padding: 13px 22px;
          border-radius: 12px;
        }
        .highlight-box {
          margin-top: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
        }
        .highlight-title {
          margin: 0 0 8px;
          font-size: 13px;
          letter-spacing: 0.4px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
        }
        .highlight-text {
          margin: 0;
          font-size: 14px;
          color: #0f172a;
          line-height: 1.6;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding: 18px 32px 28px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.7;
        }
        .footer a {
          color: #1d4ed8;
          text-decoration: none;
        }
        @media only screen and (max-width: 640px) {
          .hero,
          .content,
          .footer {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .hero-title {
            font-size: 24px !important;
          }
        }
      </style>
    </head>
    <body>
      <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        Welcome to ${appName}. Your account is ready and secure.
      </div>
      <div class="wrapper">
        <div class="email-card">
          <div class="hero">
            <div class="brand">${appName}</div>
            <h1 class="hero-title">Welcome aboard, ${name}!</h1>
            <p class="hero-subtitle">Your account is now active. Start managing transactions with confidence and security.</p>
          </div>

          <div class="content">
            <p class="greeting">Great to have you with us.</p>
            <p class="paragraph">
              Thank you for registering. We've set up your access so you can begin tracking balances,
              monitoring activity, and managing your banking operations from a single dashboard.
            </p>

            <div class="cta-wrap">
              <a class="btn" href="${dashboardUrl}" target="_blank" rel="noopener noreferrer">Go To Dashboard</a>
            </div>

            <div class="highlight-box">
              <p class="highlight-title">Need help?</p>
              <p class="highlight-text">
                Contact our support team at
                <a href="mailto:${supportEmail}" style="color:#1d4ed8; text-decoration:none;">${supportEmail}</a>
                if you have any questions.
              </p>
            </div>
          </div>

          <div class="footer">
            You are receiving this email because a new account was created with this address.<br/>
            ${appName} | Secure Banking Operations<br/>
            Need support? <a href="mailto:${supportEmail}">${supportEmail}</a>
          </div>
        </div>
      </div>
    </body>
  </html>`;
  await sendEmail(to, subject, text, html);
};

const sendTransactionEmail = async (to, name, amount, type) => {
  const subject = `Transaction Alert: ${type} of $${amount}`;
  const text = `Hi ${name},\n\nA ${type} of $${amount} has been made on your account. If you did not authorize this transaction, please contact our support team immediately.\n\nBest regards,\nThe Banking Team`;
  const html = `<p>Hi ${name},</p><p>A <strong>${type}</strong> of <strong>$${amount}</strong> has been made on your account. If you did not authorize this transaction, please contact our support team immediately.</p><p>Best regards,<br>The Banking Team</p>`;
  await sendEmail(to, subject, text, html);
}

module.exports = { sendEmail, sendRegistrationEmail,sendTransactionEmail, transporter };


