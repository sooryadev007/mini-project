import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  try {
    const posters = await prisma.poster.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ posters });
  } catch (error) {
    console.error("Poster fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch posters" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { title, description, imageUrl, link } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and Image URL are required" }, { status: 400 });
    }

    const poster = await prisma.poster.create({
      data: {
        title,
        description,
        imageUrl,
        link,
      },
    });

    return NextResponse.json({ poster });
  } catch (error) {
    console.error("Poster creation error:", error);
    return NextResponse.json({ error: "Failed to create poster" }, { status: 500 });
  }
}
