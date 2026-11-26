/* WaveFern email templates (v56.0.4). Two emails: verify the address, reset the password.
   Table layout + inline styles only, because mail apps strip <style> and ignore CSS grid. Every value that goes into the HTML is escaped. */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const INK = '#0b1020', CARD = '#141b33', LINE = '#26305a', TEXT = '#e9edff', MUTE = '#9aa6d6', FERN = '#4be39a';

function shell({ preheader, title, intro, button, link, outro }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${INK};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${INK};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td align="center" style="padding:6px 0 18px;font:700 26px/1 'Courier New',monospace;letter-spacing:6px;color:${FERN};">WAVEFERN</td></tr>
<tr><td style="background:${CARD};border:1px solid ${LINE};border-radius:14px;padding:28px 26px;font:16px/1.55 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};">
<h1 style="margin:0 0 12px;font:700 21px/1.25 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};">${esc(title)}</h1>
<p style="margin:0 0 22px;color:${TEXT};">${intro}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td style="background:${FERN};border-radius:10px;"><a href="${esc(link)}" style="display:inline-block;padding:13px 26px;font:700 16px/1 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${INK};text-decoration:none;">${esc(button)}</a></td></tr></table>
<p style="margin:0 0 6px;font-size:13px;color:${MUTE};">Button not working? Copy this link into your browser:</p>
<p style="margin:0 0 22px;font-size:12px;word-break:break-all;color:${MUTE};">${esc(link)}</p>
<p style="margin:0;font-size:13px;color:${MUTE};">${outro}</p>
</td></tr>
<tr><td align="center" style="padding:16px 8px 0;font:12px/1.5 -apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${MUTE};">WaveFern is a fictional music career game · <a href="https://wavefern.com/" style="color:${MUTE};">wavefern.com</a></td></tr>
</table></td></tr></table></body></html>`;
}

function verifyEmail(link) {
  const html = shell({
    preheader: 'One tap to finish setting up your WaveFern account.',
    title: 'Confirm your email',
    intro: 'Welcome to WaveFern. Tap the button to confirm this email address and unlock your cloud save, friends and band rooms.',
    button: 'Confirm my email', link,
    outro: 'If you did not create a WaveFern account you can ignore this email and nothing will happen.',
  });
  const text = `Welcome to WaveFern.\n\nConfirm your email address by opening this link:\n${link}\n\nIf you did not create a WaveFern account, ignore this email.`;
  return { subject: 'Confirm your WaveFern email', html, text };
}

function resetEmail(link) {
  const html = shell({
    preheader: 'Choose a new WaveFern password.',
    title: 'Reset your password',
    intro: 'Someone (hopefully you) asked to set a new password for this WaveFern account. Tap the button to choose one. If you signed in with Google before, this also lets you sign in with this email and a password.',
    button: 'Choose a new password', link,
    outro: 'If you did not ask for this, ignore this email. Your password stays as it is. The link works once and expires after about an hour.',
  });
  const text = `Someone (hopefully you) asked to set a new password for this WaveFern account.\n\nChoose a new password:\n${link}\n\nIf you did not ask for this, ignore this email. The link works once and expires after about an hour.`;
  return { subject: 'Reset your WaveFern password', html, text };
}

export { verifyEmail, resetEmail, esc };
