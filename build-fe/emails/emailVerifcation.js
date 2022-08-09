"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: parametrised variables
const VERIFY_EMAIL_ENDPOINT = 'verify-email';
const getEmailVerificationSubject = (userEmail) => `Perfi - email verification for ${userEmail}`;
// TODO: Find how not to hardcode host
const getEmailVerificationBody = (verifyUrl) => `<p>Dear user,</p>
  <p>To confirm your account please follow the below link:</p>
  <p>
  <a href="${verifyUrl}">
  ${verifyUrl}
  </a>
  <p>Thanks<br/>The Perfi Team</p>`;
const getEmailVerificationData = (hostName, to, token) => {
    const verifyUrl = `http://${hostName}/${VERIFY_EMAIL_ENDPOINT}/${token}`;
    const message = {
        from: 'no-reply@perfi.io',
        to,
        subject: getEmailVerificationSubject(to),
        html: getEmailVerificationBody(verifyUrl),
    };
    return message;
};
exports.default = getEmailVerificationData;
