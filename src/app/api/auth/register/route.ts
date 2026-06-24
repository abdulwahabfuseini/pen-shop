import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Use a more reliable transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(req: Request) {
  try {
    // const secretKey = req.headers.get("x-secret-Password");
    // if (secretKey !== process.env.USER_SECRET_KEY) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 401 },
    //   );
    // }
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        passwordChanged: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admin list" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phoneNumber, role } = await req.json();

    // if (secretKey !== process.env.USER_SECRET_KEY) {
    //   return NextResponse.json(
    //     { error: "Unauthorized Secret Key" },
    //     { status: 401 },
    //   );
    // }

    if (!firstName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.admin.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const tempPassword = uuidv4().substring(0, 8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const appName = "YamaTech Ltd";

    try {
      const isRoleAdmin = role === "ADMIN";

      await transporter.sendMail({
        from: `"NOVAREASE ARCHIVAL BUREAU" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Access Authorized — Novarease ${isRoleAdmin ? "Curator" : "Registry"} Portal`,
        html: `
    <div style="background-color: #F5F2EB; padding: 40px 20px; font-family: 'Georgia', serif; color: #1A1A18; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 4px; border: 1px solid rgba(184, 151, 58, 0.2); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1A1A18; padding: 50px 30px; border-bottom: 4px solid #B8973A;">
          <div style="font-size: 24px; letter-spacing: 0.3em; color: #F5F2EB; text-transform: uppercase; font-weight: 300;">
            Novarease
          </div>
          <div style="font-family: 'Arial', sans-serif; font-[10px]; letter-spacing: 0.5em; color: #B8973A; text-transform: uppercase; margin-top: 10px; font-weight: bold;">
           Admin Dashboard
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 50px 40px; text-align: left;">
          <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; color: #1A1A18;">
            Greetings, <b>${firstName}</b>.
          </p>
          <p style="font-family: 'Arial', sans-serif; font-size: 14px; line-height: 1.8; color: #4A4A48; margin-bottom: 30px;">
            Your identity has been successfully verified. You have been granted <b>${role}</b> Access to the Novarease internal collection and inventory registry.
          </p>

          <!-- Credential Dossier -->
          <div style="background-color: #FDFCF9; border: 1px solid #B8973A; padding: 30px; margin-bottom: 35px; text-align: center;">
            <p style="font-family: 'Arial', sans-serif; font-size: 9px; color: #B8973A; text-transform: uppercase; font-weight: 900; margin-bottom: 15px; letter-spacing: 3px;">
              Temporary Password
            </p>
            <div style="display: inline-block; padding: 10px 20px; border-bottom: 2px solid #1A1A18;">
              <span style="font-size: 26px; color: #1A1A18; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 4px;">
                ${tempPassword}
              </span>
            </div>
          </div>

          <div style="border-left: 2px solid #B8973A; padding-left: 20px; margin-bottom: 40px;">
            <p style="font-family: 'Arial', sans-serif; font-size: 12px; color: #1A1A18; font-style: italic; line-height: 1.6; margin: 0;">
              <b>Security Protocol:</b> This Password is valid for initial entry only. You are required to define a permanent master password upon your first handshake with the system.
            </p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/signin" 
             style="display: block; background-color: #1A1A18; color: #B8973A; padding: 20px; text-align: center; text-decoration: none; font-family: 'Arial', sans-serif; font-weight: bold; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; border-radius: 2px;">
            Authorize Session
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #FDFCF9; padding: 40px; text-align: center; font-family: 'Arial', sans-serif; border-top: 1px solid rgba(184, 151, 58, 0.1);">
          <p style="margin: 0; font-size: 10px; font-weight: bold; color: #1A1A18; letter-spacing: 2px; text-transform: uppercase;">
            © ${new Date().getFullYear()} Novarease Security Protocols
          </p>
          <p style="margin: 8px 0 0; font-size: 9px; color: #B8973A; letter-spacing: 1px;">PRIVATE ARCHIVE | AUTHORIZED PERSONNEL ONLY</p>
          <p style="margin: 25px 0 0; font-size: 9px; color: #A1A19E; font-style: italic; line-height: 1.5;">
            This is an automated transmission from the Archival Bureau. <br/> Access attempts are logged under archival ID: ${email}.
          </p>
        </div>
      </div>
    </div>
  `,
      });
    } catch (mailError: any) {
      console.error("NODEMAILER ERROR:", mailError.message);
      return NextResponse.json(
        { error: "Failed to send credential email. User not created." },
        { status: 500 },
      );
    }

    // 2. CREATE USER ONLY IF EMAIL SUCCEEDED
    await prisma.admin.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        passwordChanged: false,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created and email sent.",
    });
  } catch (error) {
    console.error("GENERAL REGISTRATION ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
