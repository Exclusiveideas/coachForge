import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "CoachForge <noreply@coachforge.io>";

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset Your Password - CoachForge",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background:#ffffff;border-radius:16px;border:1px solid #E5DDD0;overflow:hidden">
  <tr><td style="background:#4A3728;padding:32px;text-align:center">
    <div style="font-size:32px;margin-bottom:12px">🔒</div>
    <h1 style="color:#ffffff;font-size:22px;margin:0">Reset Your Password</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0">We received a request to reset your password</p>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#4A3728;font-size:15px;line-height:1.6;margin:0 0 24px">Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${resetLink}" style="display:inline-block;background:#E8853D;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600">Reset Password</a>
      </td></tr>
    </table>
    <div style="background:#FFF8F0;border:1px solid #E5DDD0;border-radius:10px;padding:16px;margin-top:24px">
      <p style="color:#8B7355;font-size:13px;margin:0;line-height:1.5">
        <strong>Security info:</strong><br>
        • This link expires in 1 hour<br>
        • It can only be used once<br>
        • If you didn't request this, ignore this email
      </p>
    </div>
    <p style="color:#8B7355;font-size:12px;margin:24px 0 0;word-break:break-all">
      Or copy this link: <a href="${resetLink}" style="color:#E8853D">${resetLink}</a>
    </p>
  </td></tr>
  <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #E5DDD0">
    <p style="color:#8B7355;font-size:12px;margin:0">CoachForge — Build AI coaches in seconds</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
    `.trim(),
  });
}

export async function sendVerificationEmail(email: string, name: string | null, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyLink = `${appUrl}/verify-email?token=${token}`;
  const displayName = name || "there";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to CoachForge — Verify Your Email",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background:#ffffff;border-radius:16px;border:1px solid #E5DDD0;overflow:hidden">
  <tr><td style="background:#4A3728;padding:32px;text-align:center">
    <div style="font-size:32px;margin-bottom:12px">🎯</div>
    <h1 style="color:#ffffff;font-size:22px;margin:0">Welcome to CoachForge!</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0">You're one step away from building AI coaches</p>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#4A3728;font-size:15px;line-height:1.6;margin:0 0 8px">Hey ${displayName},</p>
    <p style="color:#4A3728;font-size:15px;line-height:1.6;margin:0 0 24px">Thanks for signing up! Please verify your email address to get started.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${verifyLink}" style="display:inline-block;background:#E8853D;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600">Verify Email</a>
      </td></tr>
    </table>
    <div style="background:#FFF8F0;border:1px solid #E5DDD0;border-radius:10px;padding:16px;margin-top:24px">
      <p style="color:#8B7355;font-size:13px;margin:0;line-height:1.5">
        <strong>What you can do with CoachForge:</strong><br>
        • Create AI coaches with custom personalities<br>
        • Train them with your own knowledge base<br>
        • Embed them on any website with one line of code
      </p>
    </div>
    <p style="color:#8B7355;font-size:12px;margin:24px 0 0;word-break:break-all">
      Or copy this link: <a href="${verifyLink}" style="color:#E8853D">${verifyLink}</a>
    </p>
  </td></tr>
  <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #E5DDD0">
    <p style="color:#8B7355;font-size:12px;margin:0">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
    `.trim(),
  });
}
