import { NextResponse } from "next/server";
import { getSession, verifyToken } from "@/lib/jwt";
import { getPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const prisma = getPrisma();

export async function GET() {
  try {
    const payload = await getSession();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studentProfile: true,
          placementOfficer: true,
          adminProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
