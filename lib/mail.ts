import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"EduPlacement" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Verification OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f2a4a; text-align: center;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for EduPlacement portal verification is:</p>
        <div style="background: #f0f2f5; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #0f2a4a; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">EduPlacement - Institutional Career Services</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
