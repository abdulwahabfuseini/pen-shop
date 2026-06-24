import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
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
    const { identifier, password } = await req.json();

    // 1. Find User
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneNumber: identifier }],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 2. Verify Password (UUID or Permanent)
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 3. Check if admin needs to setup password (UUID Phase)
    // FIX: Added email and firstName to the response so the frontend can display them
    if (!admin.passwordChanged) {
      return NextResponse.json({
        nextStep: "SET_NEW_PASSWORD",
        userId: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      });
    }

    // 4. GENERATE 2FA CODE
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 Min Expiry

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        verificationCode: code,
        codeExpires: expires,
      },
    });

    // 5. SEND EMAIL
    try {
      await transporter.sendMail({
        from: `"YAMATECH SECURITY" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: `Verification Code: ${code} - Yamatech Access`, // Fixed template string
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

        <div style="padding: 30px 15px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Secure Login Attempt</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 10px; line-height: 1.5;">
            A login attempt to your Yamatech account requires additional authorization. Please use the following code to proceed:
          </p>

          <!-- Verification Code Box -->
          <div style="margin: 35px 0; padding: 10px; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;">
            <div style="font-size: 45px; font-weight: 900; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', Courier, monospace;">
              ${code}
            </div>
            <p style="margin-top: 15px; font-size: 10px; font-weight: bold; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">
              Expires in 10 minutes
            </p>
          </div>

          <div style="text-align: left; background-color: #fff9f0; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.4;">
              <b>Security Warning:</b> If you did not request this code, please ignore this email or contact the IT department immediately. Your account security may be at risk.
            </p>
          </div>
        </div>

        <!-- Professional Footer -->
        <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: bold; color: #64748b;">
            &copy; ${new Date().getFullYear()} YAMATECH | IT Security Department
          </p>
          <p style="margin: 5px 0 0;">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  `,
      });
    } catch (mailError) {
      console.error("Mail failed:", mailError);
      return NextResponse.json(
        { error: "Failed to send verification code via email" },
        { status: 500 },
      );
    }

    // 6. Tell frontend to go to Verify Page
    return NextResponse.json({
      nextStep: "VERIFY_2FA",
      userId: admin.id,
      identifier: identifier,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    });
  } catch (error) {
    console.error("LOGIN_CHECK_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
