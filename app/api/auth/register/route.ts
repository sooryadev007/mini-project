import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const prisma = getPrisma();

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (role === "STUDENT") {
      return NextResponse.json({ error: "Students must be added by a Placement Officer and cannot register themselves." }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        studentProfile: role === "STUDENT" ? { 
          create: { 
            rollNumber: `STU-${Date.now()}`, 
            department: "General", 
            year: 1, 
            cgpa: 0 
          } 
        } : undefined,
        placementOfficer: role === "PLACEMENT_OFFICER" ? { 
          create: { 
            employeeId: `PO-${Date.now()}`, 
            department: "Placement" 
          } 
        } : undefined,
        adminProfile: role === "ADMIN" ? { create: {} } : undefined,
      },
    });

    const token = await signToken({ userId: user.id, role: user.role, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
