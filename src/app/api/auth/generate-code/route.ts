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
      from: `"NOVAREASE ARCHIVAL BUREAU" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: `Authorization Token: ${code} — Novarease Access`,
      html: `
    <div style="background-color: #F5F2EB; padding: 50px 20px; font-family: 'Georgia', serif; color: #1A1A18;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid rgba(184, 151, 58, 0.2); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);">
        
        <!-- Luxury Top Bar -->
        <div style="height: 4px; background-color: #B8973A;"></div>

        <div style="padding: 50px 40px; text-align: center;">
          
          <!-- Branding -->
          <div style="margin-bottom: 40px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 0.3em; color: #1A1A18; text-transform: uppercase;">
              Novarease
            </h1>
            <p style="margin: 10px 0 0; font-family: 'Arial', sans-serif; font-size: 9px; font-weight: bold; color: #B8973A; text-transform: uppercase; letter-spacing: 4px;">
               Identity Authorization
            </p>
          </div>

          <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: normal; color: #1A1A18; font-style: italic;">
            Secure Handshake Required
          </h2>
          <p style="margin: 0; font-family: 'Arial', sans-serif; font-size: 13px; color: #4A4A48; line-height: 1.8; letter-spacing: 0.02em;">
            An administrative session is being requested for the Novarease archives. Please use the following unique token to finalize your authorization.
          </p>

          <!-- Passcode Display -->
          <div style="margin: 45px 0; padding: 40px 20px; background-color: #FDFCF9; border: 1px solid #B8973A;">
            <div style="font-size: 48px; font-weight: bold; letter-spacing: 14px; color: #1A1A18; font-family: 'Courier New', Courier, monospace; margin-left: 14px;">
              ${code}
            </div>
            <div style="margin-top: 25px;">
              <span style="font-family: 'Arial', sans-serif; font-size: 9px; font-weight: 900; color: #B8973A; text-transform: uppercase; letter-spacing: 3px;">
                Valid for 10 minutes
              </span>
            </div>
          </div>

          <!-- Subtle Alert Inset -->
          <div style="background-color: #FDFCF9; border-left: 2px solid #1A1A18; padding: 20px; text-align: left; margin-top: 20px;">
            <p style="margin: 0; font-family: 'Arial', sans-serif; font-size: 11px; color: #1A1A18; line-height: 1.6; font-style: italic;">
              <b>Archival Protocol:</b> If you did not initiate this handshake, your master key may be compromised. Please notify the Bureau immediately.
            </p>
          </div>
        </div>

        <!-- Professional Boutique Footer -->
        <div style="background-color: #FDFCF9; padding: 35px; text-align: center; font-family: 'Arial', sans-serif; border-top: 1px solid rgba(184, 151, 58, 0.1);">
          <p style="margin: 0; font-size: 9px; font-weight: bold; color: #1A1A18; text-transform: uppercase; letter-spacing: 3px;">
            © ${new Date().getFullYear()} Novarease Security & Archival Bureau
          </p>
          <p style="margin: 8px 0 0; font-size: 8px; color: #B8973A; text-transform: uppercase; letter-spacing: 2px;">Authorized Personnel Curation Only</p>
        </div>
      </div>
      
      <!-- Bottom Decorative Link -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 10px; color: #1A1A18; opacity: 0.3; text-transform: uppercase; letter-spacing: 2px;">
            Encryption ID: NVR-${Date.now().toString().slice(-6)}
        </p>
      </div>
    </div>
  `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
