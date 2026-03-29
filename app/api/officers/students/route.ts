import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
  const session = await checkPermission();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { studentProfile: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await checkPermission();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // Check if it's bulk upload (CSV) or single
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(async (s: any) => {
        try {
          const normalizedEmail = (s.email || "").toLowerCase().trim();
          const hashedPassword = await bcrypt.hash(s.password || "password123", 10);
          return await prisma.user.create({
            data: {
              id: crypto.randomUUID(),
              name: s.name,
              email: normalizedEmail,
              password: hashedPassword,
              role: "STUDENT",
              studentProfile: {
                create: {
                  rollNumber: s.rollNumber || `ROLL-${Date.now()}-${Math.random()}`,
                  department: s.department || "General",
                  year: parseInt(s.year) || 1,
                  cgpa: parseFloat(s.cgpa) || 0.0,
                }
              }
            }
          });
        } catch (e) {
          console.error("Error creating student in bulk:", e);
          return null;
        }
      }));
      return NextResponse.json({ message: "Bulk upload completed", count: results.filter((r: any) => r !== null).length });
    } else {
      const { name, email, password, rollNumber, department, year, cgpa } = body;
      const normalizedEmail = email.toLowerCase().trim();
      const hashedPassword = await bcrypt.hash(password || "password123", 10);
      
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "STUDENT",
          studentProfile: {
            create: {
              rollNumber,
              department,
              year: parseInt(year),
              cgpa: parseFloat(cgpa),
            }
          }
        }
      });
      return NextResponse.json({ user });
    }
  } catch (error: any) {
    console.error("Student creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email or Roll Number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
