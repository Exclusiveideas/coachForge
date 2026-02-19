import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-session";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
