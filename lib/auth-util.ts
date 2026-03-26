import { getSession } from "@/lib/jwt";

export async function verifyAuth(req?: Request) {
  try {
    const session = await getSession();
    
    if (!session) return null;
    return { 
      id: session.userId as string, 
      role: session.role as string, 
      email: session.email as string 
    };
  } catch (error) {
    console.error("verifyAuth Error:", error);
    return null;
  }
}
