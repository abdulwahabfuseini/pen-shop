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
        from: `"NOVAREASE SECURITY" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: `Authorization Protocol: ${code} — Novarease Access`,
        html: `
    <div style="background-color: #F5F2EB; padding: 40px 15px; font-family: 'Georgia', serif; color: #1A1A18; text-align: center;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; border: 1px solid rgba(184, 151, 58, 0.2); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
        
        <!-- Luxury Top Accent -->
        <div style="height: 4px; background-color: #B8973A;"></div>

        <div style="padding: 40px 30px;">
          <!-- Branding -->
          <div style="margin-bottom: 40px; text-align: center;">
            <div style="font-size: 22px; letter-spacing: 0.3em; color: #1A1A18; text-transform: uppercase; font-weight: 300;">
              Novarease
            </div>
            <div style="font-family: 'Arial', sans-serif; font-size: 9px; letter-spacing: 0.5em; color: #B8973A; text-transform: uppercase; margin-top: 10px; font-weight: bold;">
              Security & Archival Bureau
            </div>
          </div>

          <h2 style="margin: 0; font-size: 20px; font-weight: normal; color: #1A1A18; font-style: italic;">Identity Validation Protocol</h2>
          <p style="font-family: 'Arial', sans-serif; color: #4A4A48; font-size: 13px; margin-top: 15px; line-height: 1.6; letter-spacing: 0.02em;">
            An administrative session is being requested. Please use the following one-time archival token to authorize this handshake:
          </p>

          <!-- Verification Code Box -->
          <div style="margin: 40px 0; padding: 30px 10px; background-color: #FDFCF9; border: 1px solid #B8973A;">
            <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #1A1A18; font-family: 'Courier New', monospace; margin-left: 12px;">
              ${code}
            </div>
            <p style="margin-top: 20px; font-family: 'Arial', sans-serif; font-size: 9px; font-weight: 900; color: #B8973A; text-transform: uppercase; letter-spacing: 3px;">
              Valid for 10 minutes
            </p>
          </div>

          <!-- Alert Box -->
          <div style="text-align: left; background-color: #FDFCF9; border-left: 3px solid #1A1A18; padding: 20px; margin-bottom: 10px;">
            <p style="margin: 0; font-family: 'Arial', sans-serif; font-size: 11px; color: #1A1A18; line-height: 1.5; font-style: italic;">
              <b>Security Notice:</b> If this request was not initiated by you, your master key may be compromised. Please notify the Bureau immediately.
            </p>
          </div>
        </div>

        <!-- Minimalist Footer -->
        <div style="background-color: #FDFCF9; padding: 30px; text-align: center; font-family: 'Arial', sans-serif; border-top: 1px solid rgba(184, 151, 58, 0.1);">
          <p style="margin: 0; font-size: 9px; font-weight: bold; color: #1A1A18; letter-spacing: 2px; text-transform: uppercase;">
            © ${new Date().getFullYear()} Novarease Archival Bureau
          </p>
          <p style="margin: 5px 0 0; font-size: 8px; color: #B8973A; text-transform: uppercase; letter-spacing: 1px;">Authorized Personnel Handshake</p>
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
