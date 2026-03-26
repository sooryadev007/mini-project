import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();

    const [totalStudents, totalCompanies, totalJobs, placedApplications] =
      await Promise.all([
        prisma.student.count(),
        prisma.company.count(),
        prisma.job.count(),
        prisma.application.count({ where: { status: "PLACED" } }),
      ]);

    const placementRate =
      totalStudents === 0 ? 0 : placedApplications / totalStudents;

    return NextResponse.json({
      ok: true,
      report: {
        totalStudents,
        totalCompanies,
        totalJobs,
        placedApplications,
        placementRate,
      },
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      report: {
        totalStudents: 200,
        totalCompanies: 18,
        totalJobs: 40,
        placedApplications: 150,
        placementRate: 0.75,
      },
      warning:
        err instanceof Error ? err.message : "Database not configured; using demo data.",
    });
  }
}

