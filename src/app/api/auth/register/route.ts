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
    // const secretKey = req.headers.get("x-secret-key");
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
        from: `"YAMATECH SECURITY" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Access Granted - ${isRoleAdmin ? "Administrative" : "Staff"} Portal`,
        html: `
    <div style="background-color: #f1f5f9; padding: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        
        <!-- Header -->
        <div style="background-color: ${isRoleAdmin ? "#0f172a" : "#2563eb"}; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">
            ${isRoleAdmin ? "Admin Account Provisioned" : "Staff Account Created"}
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hello <b>${firstName}</b>,
          </p>
          <p>You have been assigned <b>${role}</b> access to the Yamatech Inventory System.</p>

          <!-- Credential Box -->
          <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 20px 0; text-align: center;">
            <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px;">
              Temporary Access Password
            </p>
            <div style="background-color: #ffffff; border: 1.5px dashed #cbd5e1; padding: 12px; display: inline-block; min-width: 200px;">
              <span style="font-size: 22px; color: #2563eb; font-weight: bold; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px;">
                ${tempPassword}
              </span>
            </div>
          </div>

          <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 30px;">
            <p style="font-size: 13px; color: #475569; margin: 0;">
              <b>Security Requirement:</b> You will be required to update this temporary password immediately upon your first successful login to ensure account integrity.
            </p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/signin" 
             style="display: block; background-color: #0f172a; color: #ffffff; padding: 15px; text-align: center; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            Access Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-weight: bold; color: #64748b;">
            &copy; ${new Date().getFullYear()} YAMATECH | IT Security Department
          </p>
          <p style="margin: 5px 0 0;">Authorized Personnel Only</p>
          <p style="margin: 15px 0 0; font-size: 10px;">
            This is an automated system message. Please do not reply directly to this email.
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
