import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();

    const admin = await prisma.admin.findUnique({
      where: { id: identifier },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "User not recognized" },
        { status: 401 },
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.admin.update({
      where: { id: admin.id },
      data: { verificationCode: code, codeExpires: expires },
    });

    // Send the email
    await transporter.sendMail({
      from: `"YAMATECH SECURITY" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      // Including the code in the subject is a professional UX practice for mobile notifications
      subject: `Verification Code: ${code} - Yamatech Security`,
      html: `
    <div style="background-color: #f1f5f9; padding: 30px 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
      <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Security Accent Bar -->
        <div style="height: 6px; background-color: #2563eb;"></div>

        <div style="padding: 30px 15px; text-align: center;">
          <!-- Branding -->
          <div style="margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
              YAMA<span style="color: #2563eb;">TECH</span>
            </h1>
            <p style="margin: 5px 0 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
               Identity Verification
            </p>
          </div>

          <h2 style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #1e293b;">Authentication Required</h2>
          <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
            Please enter the following one-time passcode to complete your authorization.
          </p>

          <!-- Passcode Display -->
          <div style="margin: 35px 0; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #0f172a; font-family: 'Courier New', Courier, monospace; margin-left: 12px;">
              ${code}
            </div>
            <div style="margin-top: 15px; display: inline-block; padding: 4px 12px; background-color: #fef2f2; border-radius: 4px;">
              <span style="font-size: 11px; font-weight: bold; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">
                Valid for 10 minutes
              </span>
            </div>
          </div>

          <!-- Alert Box -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; text-align: left;">
            <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.4;">
              <b>Security Protocol:</b> If you did not attempt to sign in to Yamatech Pro, please change your password immediately and contact your system administrator.
            </p>
          </div>
        </div>

        <!-- Corporate Footer -->
        <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
            &copy; ${new Date().getFullYear()} YAMATECH | IT Security Department
          </p>
          <p style="margin: 4px 0 0; font-weight: bold; color: #cbd5e1;">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
