// Transactional email stub. Swap for a real provider later.
// In development this logs to the server console so you can retrieve codes/links.

type MailArgs = { to: string; subject: string; text: string };

export async function sendMail({ to, subject, text }: MailArgs) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('\n──── [dev mail] ────');
    // eslint-disable-next-line no-console
    console.log('To:     ', to);
    // eslint-disable-next-line no-console
    console.log('Subject:', subject);
    // eslint-disable-next-line no-console
    console.log(text);
    // eslint-disable-next-line no-console
    console.log('────────────────────\n');
  }
}
