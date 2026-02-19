import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-session";
import { getCoachById } from "@/lib/services/coachService";
import { SettingsForm } from "@/components/coaches/SettingsForm";

export default async function CoachSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();
  const coach = await getCoachById(id, session!.user.id);

  if (!coach) notFound();

  return <SettingsForm coach={coach} />;
}
