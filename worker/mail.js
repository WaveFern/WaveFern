/* WaveFern email templates. Two emails: verify the address, reset the password.
   Look (James's Photoshop mockup): no card. The page has its own solid background (white, or the game's #0c0f0d in dark mode) so the text is always readable: with no background, Outlook on the web showed white dark-mode text on its white reading pane. Green pixel WAVEFERN logo with a dark-green
   hard shadow, a pixel heading, monospace body, and a black "main menu" button with a white pixel label and a green offset shadow. Light is the main design;
   a dark theme (white heading and text) switches on in apps that support prefers-color-scheme (Apple Mail, iPhone Mail, Outlook Mac). Gmail ignores that rule and
   shows the light design (its apps may darken it themselves). Colours are the game's tokens (docs/THEMES.md): --g #2fe68a, --gat #04120a, --m #8aa094.
   Email-safe: table layout and inline styles carry the light design; the <style> block adds the dark theme, hover, web font and mobile padding.
   Every value that goes into the HTML is escaped. The link is always the one the Worker made; nothing here is hardcoded. */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const GREEN = '#2fe68a', SHADOW = '#1d4a37', INK = '#161616', LINE = '#dfe6e2', BODY = '#3a4540', MUTE = '#6b7a72', LINKG = '#178f55';
const PIX = "Silkscreen,'Courier New',Courier,monospace";
const MONO = "ui-monospace,Menlo,Consolas,'Courier New',monospace"; /* the game's body font; the only other font is Silkscreen */
const SITE = 'https://wavefern.com';

function shell({ preheader, title, intro, button, link, outro }) {
  const L = esc(link), a = `color:${MUTE};text-decoration:underline;white-space:nowrap;`;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0;padding:0;-webkit-text-size-adjust:100%;background:#ffffff;}
a.wf-btn:hover{background:#2a2a2a !important;}
@media (prefers-color-scheme:dark){a.wf-btn:hover{background:#5df0a6 !important;}}
@media (prefers-color-scheme:dark){
 body,.wf-bg{background:#0c0f0d !important;}
 .wf-h{color:#ffffff !important;}
 .wf-body{color:#e8f3ec !important;}
 .wf-mute{color:#8aa094 !important;}
 .wf-line{border-top-color:#2a352e !important;}
 .wf-link{color:#2fe68a !important;}
 .wf-foot a{color:#8aa094 !important;}
 .wf-bface{background:#2fe68a !important;}
 a.wf-btn{background:#2fe68a !important;color:#000000 !important;}
 .wf-bsh{background:#000000 !important;}
}
/* Outlook (phone, Android, web) darkens on its own and ignores prefers-color-scheme; it tags elements with data-ogsc (text) and data-ogsb (background). Force the game colours. */
[data-ogsb] body,[data-ogsb] .wf-bg{background:#0c0f0d !important;background-color:#0c0f0d !important;}
[data-ogsc] .wf-h{color:#ffffff !important;}
[data-ogsc] .wf-body{color:#e8f3ec !important;}
[data-ogsc] .wf-mute{color:#8aa094 !important;}
[data-ogsc] .wf-link{color:#2fe68a !important;}
[data-ogsc] .wf-foot a{color:#8aa094 !important;}
[data-ogsb] .wf-bface,[data-ogsb] a.wf-btn{background:#2fe68a !important;background-color:#2fe68a !important;}
[data-ogsc] a.wf-btn{color:#000000 !important;}
[data-ogsb] .wf-bsh{background:#000000 !important;background-color:#000000 !important;}
@media (max-width:620px){
 .wf-pad{padding-left:20px !important;padding-right:20px !important;}
 .wf-logo{font-size:30px !important;letter-spacing:3px !important;}
 .wf-title{font-size:16px !important;}
 .wf-btn-wrap{width:92% !important;}
 a.wf-btn{letter-spacing:2px !important;font-size:15px !important;padding-left:12px !important;padding-right:12px !important;}
}
</style>
</head>
<body class="wf-bg" style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" class="wf-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;">
<tr><td class="wf-bg" align="center" bgcolor="#ffffff" style="padding:44px 16px;background:#ffffff;">
<!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

<tr><td class="wf-pad" align="center" style="padding:0 0 44px;"><a href="${SITE}/" class="wf-logo" style="font:700 40px/1 ${PIX};letter-spacing:5px;color:${GREEN};text-shadow:3px 3px 0 ${SHADOW};text-decoration:none;">WAVEFERN</a></td></tr>

<tr><td class="wf-pad wf-h wf-title" align="center" style="padding:0 32px;font:700 22px/1.35 ${PIX};letter-spacing:2px;color:${INK};">${esc(title)}</td></tr>
<tr><td class="wf-pad wf-body" align="center" style="padding:20px 32px 0;font:14px/1.75 ${MONO};color:${BODY};">${intro}</td></tr>

<tr><td class="wf-pad" align="center" style="padding:36px 32px 0;">
<!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="${L}" style="height:56px;v-text-anchor:middle;width:280px;" stroke="f" fillcolor="${INK}"><w:anchorlock/><center style="color:#ffffff;font-family:'Courier New',monospace;font-size:16px;font-weight:bold;letter-spacing:3px;">${esc(button).toUpperCase()}</center></v:rect><![endif]-->
<!--[if !mso]><!-->
<table role="presentation" class="wf-btn-wrap" cellpadding="0" cellspacing="0" border="0" style="width:280px;max-width:100%;border-collapse:collapse;">
<tr><td class="wf-bface" colspan="2" rowspan="2" height="58" align="center" style="height:58px;background:${INK};"><a href="${L}" class="wf-btn" style="display:block;padding:20px 24px 18px;background:${INK};font:700 17px/20px ${PIX};letter-spacing:3px;text-transform:uppercase;color:#ffffff;text-decoration:none;text-align:center;">${esc(button)}</a></td><td width="5" style="width:5px;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="wf-bsh" width="5" height="53" style="width:5px;height:53px;background:${GREEN};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td width="5" style="width:5px;height:5px;font-size:0;line-height:0;">&nbsp;</td><td class="wf-bsh" colspan="2" style="height:5px;background:${GREEN};font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
<!--<![endif]-->
</td></tr>

<tr><td class="wf-pad wf-mute" align="center" style="padding:28px 32px 0;font:12px/1.7 ${MONO};color:${MUTE};">${outro}</td></tr>
<tr><td class="wf-pad wf-mute" align="center" style="padding:20px 32px 0;font:11px/1.6 ${MONO};color:${MUTE};">Or paste this link:<br><a href="${L}" class="wf-link" style="color:${LINKG};text-decoration:none;word-break:break-all;">${L}</a></td></tr>

<tr><td class="wf-foot wf-mute" align="center" style="padding:36px 16px 0;font:12px/1.8 ${MONO};color:${MUTE};">
<a href="${SITE}/terms/" style="${a}">Terms of Service</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/privacy/" style="${a}">Privacy Policy</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/legal/" style="${a}">Legal</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${SITE}/wiki/contact/" style="${a}">Contact</a>
</td></tr>
<tr><td class="wf-mute" align="center" style="padding:12px 16px 0;font:11px/1.7 ${MONO};color:${MUTE};">Sent because this address was used on wavefern.com. Please don't reply.<br>WaveFern is a fictional music career game. &copy; 2026 WaveFern.</td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
}

function verifyEmail(link) {
  const html = shell({
    preheader: 'One tap to finish setting up your WaveFern account.',
    title: 'Verify your email',
    intro: 'Press the button to confirm this email and finish setting up your WaveFern account.',
    button: 'Verify', link,
    outro: 'Didn\'t sign up? Ignore this email and nothing happens.',
  });
  const text = `Confirm your email for WaveFern by opening this link:\n${link}\n\nDidn't sign up? Ignore this email.`;
  return { subject: 'Verify your WaveFern email', html, text };
}

function resetEmail(link) {
  const html = shell({
    preheader: 'Choose a new WaveFern password.',
    title: 'Reset your password',
    intro: 'Press the button to pick a new password for your WaveFern account. If you used Google before, this also lets you sign in with this email and a password.',
    button: 'Reset password', link,
    outro: 'Didn\'t ask for this? Ignore it and nothing changes. The link works once and runs out after about an hour.',
  });
  const text = `Pick a new password for your WaveFern account.\n\nChoose a new password:\n${link}\n\nIf you did not ask for this, ignore this email. The link works once and expires after about an hour.`;
  return { subject: 'Reset your WaveFern password', html, text };
}

export { verifyEmail, resetEmail, esc };
