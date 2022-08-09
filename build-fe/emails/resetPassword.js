"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: parametrised variables
const VERIFY_EMAIL_ENDPOINT = 'reset-password';
const getResetPasswordSubject = (userEmail) => `Perfi - password reset for ${userEmail}`;
const getResetPasswordBody = (verifyUrl) => `<p>Dear user,</p>
  <p>To reset your account password please follow the link below:</p>
  <p>
  <a href="${verifyUrl}">
  ${verifyUrl}
  </a>
  <p>Thanks<br/>The Perfi Team</p>`;
const getResetPasswordData = (hostName, to, token) => {
    const verifyUrl = `http://${hostName}/${VERIFY_EMAIL_ENDPOINT}/${token}`;
    const message = {
        from: 'no-reply@perfi.io',
        to,
        subject: getResetPasswordSubject(to),
        html: getResetPasswordBody(verifyUrl),
    };
    return message;
};
exports.default = getResetPasswordData;
