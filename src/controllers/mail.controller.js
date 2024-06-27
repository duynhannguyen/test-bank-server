import asyncHandler from 'express-async-handler';
import sendVerificationMail from '../services/mailer.js';

export const sendVerifyMail = asyncHandler(async (req, res) => {
  const { receiverMail } = req.body;
  const responseValues = await sendVerificationMail(receiverMail);
  res.status(200).json({
    message: responseValues
  });
});
