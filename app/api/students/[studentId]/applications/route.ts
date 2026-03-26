import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { studentId: string } },
) {
  const { studentId } = params;

  // Demo mode
  if (studentId === "demo") {
    return NextResponse.json({
      ok: true,
      applications: [
        {
          id: "demo-app-1",
          status: "PENDING",
          appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          job: { id: "demo-job-1", title: "Software Engineer" },
          company: { id: "demo-company-1", name: "TechCorp" },
        },
      ],
    });
  }

  try {
    const prisma = getPrisma();
    const applications = await prisma.application.findMany({
      where: { studentId },
      orderBy: { appliedAt: "desc" },
      include: {
        job: { include: { company: true } },
      },
      take: 50,
    });

    // shape the response a bit for UI convenience
    const shaped = applications.map((a) => ({
      id: a.id,
      status: a.status,
      appliedAt: a.appliedAt,
      job: { id: a.job.id, title: a.job.title },
      company: { id: a.job.company.id, name: a.job.company.name },
    }));

    return NextResponse.json({ ok: true, applications: shaped });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to load applications. Check DATABASE_URL and migrations.",
      },
      { status: 500 },
    );
  }
}

