import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { sendOtpEmail } from "@/lib/mail";

const prisma = getPrisma();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.userId as string },
      include: { user: true }
    });

    if (!student || !student.user.email) {
      return NextResponse.json({ error: "Student email not found" }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in student profile
    await prisma.student.update({
      where: { userId: session.userId as string },
      data: { verificationOtp: otp },
    });

    // Send real email
    const mailRes = await sendOtpEmail(student.user.email, otp);

    if (!mailRes.success) {
      return NextResponse.json({ 
        error: "Failed to send email. Ensure you have provided a valid Gmail App Password in the .env file." 
      }, { status: 500 });
    }

    return NextResponse.json({ message: `OTP sent successfully to ${student.user.email}` });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
