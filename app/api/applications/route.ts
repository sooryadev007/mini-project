import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-util";

const prisma = getPrisma();

export async function POST(req: Request) {
  const user = await verifyAuth(req);
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId, answers, isException, exceptionReason } = await req.json();
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    if (!student.isVerified) {
      return NextResponse.json({ error: "Please verify your account first" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (student.cgpa < job.minCgpa) {
      if (!isException) {
        return NextResponse.json({ error: `Minimum CGPA required is ${job.minCgpa}` }, { status: 400 });
      }
      if (!exceptionReason) {
        return NextResponse.json({ error: "Exception reason is mandatory" }, { status: 400 });
      }
    }

    const existingApplication = await prisma.application.findUnique({
      where: { studentId_jobId: { studentId: student.id, jobId } },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId,
        answers: answers || null,
        isException: !!isException,
        exceptionReason: exceptionReason || null,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student) return NextResponse.json({ applications: [] });

      const applications = await prisma.application.findMany({
        where: { studentId: student.id },
        include: { job: { include: { company: true } } },
        orderBy: { appliedAt: "desc" },
      });
      return NextResponse.json({ applications });
    } else {
      const { searchParams } = new URL(req.url);
      const jobId = searchParams.get("jobId");
      const applications = await prisma.application.findMany({
        where: jobId ? { jobId } : {},
        include: { student: { include: { user: true } }, job: { include: { company: true } } },
        orderBy: { appliedAt: "desc" },
      });
      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error("GET applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
