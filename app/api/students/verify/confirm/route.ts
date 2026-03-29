import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";

const prisma = getPrisma();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();
    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.userId as string },
    });

    if (!student || student.verificationOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Verify student
    await prisma.student.update({
      where: { userId: session.userId as string },
      data: { 
        isVerified: true,
        verificationOtp: null // Clear OTP after success
      },
    });

    return NextResponse.json({ message: "Account verified successfully!" });
  } catch (error) {
    console.error("Confirm OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
