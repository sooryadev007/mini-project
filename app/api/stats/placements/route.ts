import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();

    const [totalStudents, totalApplications, placedApplications] =
      await Promise.all([
        prisma.student.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: "PLACED" } }),
      ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalStudents,
        totalApplications,
        placedApplications,
      },
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      stats: {
        totalStudents: 200,
        totalApplications: 420,
        placedApplications: 150,
      },
      warning:
        err instanceof Error ? err.message : "Database not configured; using demo data.",
    });
  }
}

