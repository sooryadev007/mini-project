import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      users: [
        {
          id: "demo-admin",
          name: "Admin",
          email: "admin@example.com",
          role: "ADMIN",
          emailVerified: true,
          createdAt: new Date().toISOString(),
        },
      ],
      warning:
        err instanceof Error ? err.message : "Database not configured; using demo data.",
    });
  }
}

