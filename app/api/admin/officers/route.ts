import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/jwt";

const prisma = getPrisma();

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const officers = await prisma.user.findMany({
      where: { role: "PLACEMENT_OFFICER" },
      include: { placementOfficer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ officers });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, employeeId, department } = await req.json();

    if (!name || !email || !password || !employeeId || !department) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: "PLACEMENT_OFFICER",
        placementOfficer: {
          create: {
            employeeId,
            department,
          },
        },
      },
      include: { placementOfficer: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email or Employee ID already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Placement officer removed" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
