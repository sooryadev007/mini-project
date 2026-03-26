import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";

const prisma = getPrisma();

async function checkPermission() {
  const session = await getSession();
  if (!session || (session.role !== "PLACEMENT_OFFICER" && session.role !== "ADMIN")) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await checkPermission();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, requirements, salary, location, jobType, companyId, deadline, minCgpa } = await req.json();

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!companyId) return NextResponse.json({ error: "Company is required. Please create a company first if none exist." }, { status: 400 });
    if (!deadline) return NextResponse.json({ error: "Deadline is required" }, { status: 400 });

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json({ error: "Invalid deadline date format" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: requirements || [],
        salary,
        location,
        jobType,
        companyId,
        postedBy: session.userId as string,
        deadline: new Date(deadline),
        minCgpa: parseFloat(minCgpa) || 0.0,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
