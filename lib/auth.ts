import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-change-it";
const HARDCODED_USERNAME = process.env.HARDCODED_USERNAME || "thatrajaryan";
const HARDCODED_PASSWORD = process.env.HARDCODED_USER_PASSWORD || "rajaryan";
const HARDCODED_USER_ID = process.env.HARDCODED_USER_ID || "hardcoded_user_001";
const HARDCODED_USER_EMAIL = process.env.HARDCODED_USER_EMAIL || "thatrajaryan@localhost";

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "180d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function verifyLogin(username: string, password: string): Promise<{ id: string; username: string; name: string } | null> {
  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    return { id: HARDCODED_USER_ID, username: HARDCODED_USERNAME, name: HARDCODED_USERNAME };
  }
  return null;
}

export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return { id: HARDCODED_USER_ID, username: HARDCODED_USERNAME, name: HARDCODED_USERNAME };
}
