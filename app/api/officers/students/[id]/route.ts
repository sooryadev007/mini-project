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

// UPDATE a student's details
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, rollNumber, department, year, cgpa } = body;

    // Update user name & email
    await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase().trim() }),
      },
    });

    // Update student profile
    await prisma.student.update({
      where: { userId: id },
      data: {
        ...(rollNumber && { rollNumber }),
        ...(department && { department }),
        ...(year !== undefined && { year: parseInt(year) }),
        ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
      },
    });

    return NextResponse.json({ message: "Student updated successfully" });
  } catch (error: any) {
    console.error("Student update error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email or Roll Number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE a student and their profile
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkPermission();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Delete student profile first (foreign key), then user
    await prisma.student.deleteMany({ where: { userId: id } });
    await prisma.application.deleteMany({ where: { student: { userId: id } } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
