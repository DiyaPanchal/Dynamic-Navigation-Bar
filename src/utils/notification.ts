import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMenuUpdateNotification = async (
  userEmail: string,
  oldMenus: string[],
  newMenus: string[]
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Menu Access Updated",
      html: `
        <p>Hello,</p>
        <p>Your accessible menus have been updated:</p>
        <p><strong>Old Menus:</strong> ${oldMenus.join(", ")}</p>
        <p><strong>New Menus:</strong> ${newMenus.join(", ")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${userEmail}`);
  } catch (error) {
    console.error("Email Notification Error:", error);
  }
};
