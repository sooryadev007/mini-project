import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrisma();
  try {
    const { id } = await params;
    await prisma.poster.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Poster deleted" });
  } catch (error) {
    console.error("Poster delete error:", error);
    return NextResponse.json({ error: "Failed to delete poster" }, { status: 500 });
  }
}
