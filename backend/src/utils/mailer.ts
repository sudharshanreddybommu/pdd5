import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter: nodemailer.Transporter | null = null;

export async function getMailerTransporter(): Promise<nodemailer.Transporter> {
  const isCustomUser = config.email.user && 
    config.email.user !== 'your-email@gmail.com' && 
    config.email.pass && 
    config.email.pass !== 'your-app-password';

  if (isCustomUser) {
    return nodemailer.createTransport({
      service: 'gmail',
      host: config.email.host || 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  if (!transporter) {
    try {
      // Create automated test account for instantaneous live test emails
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📬 Initialized Ethereal SMTP test email service:', testAccount.user);
    } catch (e) {
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }
  return transporter;
}

export async function sendVerificationEmail(email: string, token: string, role: string = 'PATIENT') {
  const verifyLink = `${config.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}&role=${role}`;
  
  console.log('\n======================================================');
  console.log('✉️  OPMD CARE EMAIL VERIFICATION LINK GENERATED:');
  console.log(`To: ${email}`);
  console.log(`Role: ${role}`);
  console.log(`Link: ${verifyLink}`);
  console.log('======================================================\n');

  try {
    const mailer = await getMailerTransporter();
    const info = await mailer.sendMail({
      from: config.email.from || `"OPMD Care" <${config.email.user || 'noreply@opmdcare.org'}>`,
      to: email,
      subject: 'Verify your OPMD Care account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0891b2; font-size: 26px; margin: 0;">OPMD Care</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Oral Potentially Malignant Disorders Screening & Consultation Platform</p>
          </div>
          <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Verify your Email Address</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Hello,<br/><br/>
            Thank you for registering with <strong>OPMD Care</strong>. Please click the button below to verify your email address and continue setting up your ${role.toLowerCase()} account.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyLink}" style="background-color: #0891b2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(8,145,178,0.25);">
              Verify My Account
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            Or copy and paste this verification link into your browser:<br/>
            <a href="${verifyLink}" style="color: #0891b2; word-break: break-all;">${verifyLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            This link is valid for 24 hours. If you did not create an account on OPMD Care, you can safely ignore this email.
          </p>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🌐 Web Inbox Preview URL:', previewUrl);
    }
    return { success: true, verifyLink, previewUrl };
  } catch (error: any) {
    console.warn('Mail sending status:', error?.message || error);
    return { success: true, verifyLink };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${config.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  
  console.log('\n======================================================');
  console.log('🔒 OPMD CARE PASSWORD RESET LINK:');
  console.log(`To: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log('======================================================\n');

  try {
    const mailer = await getMailerTransporter();
    const info = await mailer.sendMail({
      from: config.email.from || `"OPMD Care" <${config.email.user || 'noreply@opmdcare.org'}>`,
      to: email,
      subject: 'Reset your OPMD Care password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0891b2; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            We received a request to reset the password for your OPMD Care account. Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #0891b2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            <a href="${resetLink}" style="color: #0891b2; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">This link will expire in 1 hour.</p>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🌐 Web Inbox Reset Preview URL:', previewUrl);
    }
    return { success: true, resetLink, previewUrl };
  } catch (error: any) {
    return { success: true, resetLink };
  }
}
