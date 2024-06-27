import nodemailer from 'nodemailer';
const adminUser = 'duynhannguyenn@gmail.com';
const adminPassword = 'jvmj ktsw ajve lxol';

const sendVerificationMail = async receiverMail => {
  const verificationCode = Math.floor(Math.random() * (1000 - 9999 + 1)) + 9999;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: adminUser,
      pass: adminPassword
    }
  });
  const options = {
    from: `x19fp,<TestBank>`,
    to: receiverMail,
    subject: 'Sign Up Verification ',
    html: `<p>Xin chào, ${receiverMail}, Đây là mã xác nhận của bạn: <b> ${verificationCode}</b> </p> <p>  Lưu ý mã xác nhận sẽ hết hạn sau <b> 3 phút </b> </p> ` // html body
  };
  const response = await transporter.sendMail(options);
  return { message: response.response, code: verificationCode };
};

export default sendVerificationMail;
