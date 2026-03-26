import { NextResponse, NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";

export async function GET() {
  try {
    const prisma = getPrisma();
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        location: true,
        website: true,
        industry: true,
        logo: true,
        description: true,
      },
    });

    return NextResponse.json({ ok: true, companies });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      companies: [
        {
          id: "demo-company-1",
          name: "TechCorp",
          location: "Remote",
          website: "https://example.com",
          industry: "Software",
          logo: null,
          description: "Product-focused engineering team.",
        },
      ],
      warning:
        err instanceof Error ? err.message : "Database not configured; using demo data.",
    });
  }
}
export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const { name, description, website, industry, location, logo } = await req.json();

    const session = await getSession();
    if (!session || (session.role !== "PLACEMENT_OFFICER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const officer = await prisma.placementOfficer.findUnique({
      where: { userId: session.userId as string }
    });

    if (!officer) {
      return NextResponse.json({ error: "Placement Officer profile not found" }, { status: 404 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        website,
        industry,
        location,
        logo,
        placementOfficerId: officer.id,
      },
    });

    return NextResponse.json({ ok: true, company });
  } catch (err) {
    console.error("Company creation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
