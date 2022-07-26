// TODO: parametrised variables
const VERIFY_EMAIL_ENDPOINT = 'verify_email';

const getEmailVerificationSubject = (userEmail: string) =>
  `Perfi - email verification for ${userEmail}`;

// TODO: Find how not to hardcode host
const getEmailVerificationBody = (verifyUrl: string) => `<p>Dear user,</p>
  <p>To confirm your account please follow the below link:</p>
  <p>
  <a href="${verifyUrl}">
  ${verifyUrl}
  </a>
  <p>Thanks<br/>The Perfi Team</p>`;

const getEmailVerificationData = (
  hostName: string,
  to: string,
  token: string,
) => {
  const verifyUrl = `http://${hostName}/${VERIFY_EMAIL_ENDPOINT}/${token}`;

  const message = {
    from: 'no-reply@perfi.io',
    to,
    subject: getEmailVerificationSubject(to),
    html: getEmailVerificationBody(verifyUrl),
  };
  return message;
};

export default getEmailVerificationData;
