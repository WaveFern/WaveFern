/* WaveFern email templates. Two emails: verify the address, reset the password.
   Look: deep green-black page, one quiet card, the pixel WAVEFERN logo and heading in Silkscreen, body text in a modern sans-serif.
   Email-safe: table layout and inline styles carry the whole design. The <style> block only adds extras that some clients honour
   (web font, hover, mobile padding); Gmail drops the web font and falls back to Courier New, Outlook desktop gets the VML button.
   Every value that goes into the HTML is escaped. The link is always the one the Worker made; nothing here is hardcoded. */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PAGE = '#070b09', CARD = '#0d1511', LINE = '#1c2b23', TEXT = '#f2f7f4', BODY = '#c9d4ce', MUTE = '#7f8f86', GREEN = '#2fe68a', INKG = '#04120a';
const PIX = "Silkscreen,'Courier New',Courier,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const SITE = 'https://wavefern.com';

function shell({ preheader, title, intro, button, link, outro }) {
  const L = esc(link), a = `color:${MUTE};text-decoration:underline;`;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
<style>
body{margin:0;padding:0;-webkit-text-size-adjust:100%;}
a.wf-btn:hover{background:#4ff0a0 !important;}
@media (max-width:620px){
 .wf-pad{padding-left:24px !important;padding-right:24px !important;}
 .wf-logo{font-size:26px !important;letter-spacing:3px !important;}
 .wf-h{font-size:16px !important;}
 .wf-btn-wrap{width:100% !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;color:${PAGE};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
<tr><td align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<tr><td align="center" style="padding:0 0 32px;"><a href="${SITE}/" class="wf-logo" style="font:700 32px/1 ${PIX};letter-spacing:4px;color:#ffffff;text-decoration:none;">WAVEFERN</a></td></tr>

<tr><td style="background:${CARD};border:1px solid ${LINE};border-radius:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="wf-pad wf-h" align="center" style="padding:40px 48px 0;font:700 20px/1.3 ${PIX};letter-spacing:1px;color:${GREEN};">${esc(title)}</td></tr>
<tr><td class="wf-pad" align="center" style="padding:16px 48px 0;font:16px/1.65 ${SANS};color:${BODY};">${intro}</td></tr>
<tr><td class="wf-pad" align="center" style="padding:28px 48px 0;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${L}" style="height:50px;v-text-anchor:middle;width:400px;" arcsize="16%" stroke="f" fillcolor="${GREEN}"><w:anchorlock/><center style="color:${INKG};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${esc(button)}</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<table role="presentation" class="wf-btn-wrap" width="80%" cellpadding="0" cellspacing="0" border="0" style="width:80%;max-width:400px;"><tr><td align="center" style="background:${GREEN};border-radius:8px;">
<a href="${L}" class="wf-btn" style="display:block;padding:15px 24px;border-radius:8px;background:${GREEN};font:600 16px/1.2 ${SANS};color:${INKG};text-decoration:none;text-align:center;">${esc(button)}</a>
</td></tr></table>
<!--<![endif]-->
</td></tr>
<tr><td class="wf-pad" align="center" style="padding:24px 48px 32px;font:13px/1.6 ${SANS};color:${MUTE};">${outro}</td></tr>
<tr><td class="wf-pad" style="padding:0 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${LINE};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table></td></tr>
<tr><td class="wf-pad" align="center" style="padding:20px 48px 32px;font:12px/1.6 ${SANS};color:${MUTE};">Button not working? Paste this link into your browser:<br><a href="${L}" style="color:${GREEN};opacity:.8;text-decoration:none;word-break:break-all;">${L}</a></td></tr>
</table>
</td></tr>

<tr><td align="center" style="padding:28px 16px 0;font:12px/1.8 ${SANS};color:${MUTE};">
<a href="${SITE}/terms/" style="${a}">Terms of Service</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/privacy/" style="${a}">Privacy Policy</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/legal/" style="${a}">Legal</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/wiki/contact/" style="${a}">Contact</a>
</td></tr>
<tr><td align="center" style="padding:12px 16px 0;font:11px/1.7 ${SANS};color:${MUTE};">This is an automated message, so please do not reply.<br>You received it because this address was used on wavefern.com.<br>WaveFern is a fictional music career game. &copy; 2026 WaveFern.</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}

function verifyEmail(link) {
  const html = shell({
    preheader: 'One tap to finish setting up your WaveFern account.',
    title: 'Verify your email',
    intro: 'Welcome to WaveFern. Confirm this email address to unlock your cloud save, friends and band rooms.',
    button: 'Verify email', link,
    outro: 'If you did not create a WaveFern account, you can safely ignore this email.',
  });
  const text = `Welcome to WaveFern.\n\nConfirm your email address by opening this link:\n${link}\n\nIf you did not create a WaveFern account, ignore this email.`;
  return { subject: 'Verify your WaveFern email', html, text };
}

function resetEmail(link) {
  const html = shell({
    preheader: 'Choose a new WaveFern password.',
    title: 'Reset your password',
    intro: 'We received a request to set a new password for your WaveFern account. If you signed in with Google before, this also lets you sign in with this email and a password.',
    button: 'Choose new password', link,
    outro: 'If you did not ask for this, ignore this email and your password stays the same. The link works once and expires after about an hour.',
  });
  const text = `We received a request to set a new password for your WaveFern account.\n\nChoose a new password:\n${link}\n\nIf you did not ask for this, ignore this email. The link works once and expires after about an hour.`;
  return { subject: 'Reset your WaveFern password', html, text };
}

export { verifyEmail, resetEmail, esc };
