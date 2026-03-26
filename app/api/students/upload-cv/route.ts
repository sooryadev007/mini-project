import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getPrisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-util";

const prisma = getPrisma();

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${user.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "cvs");
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);
    const cvUrl = `/uploads/cvs/${fileName}`;

    // Update student profile with the latest resume
    await prisma.student.update({
      where: { userId: user.id },
      data: { resume: cvUrl },
    });

    return NextResponse.json({ cvUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
