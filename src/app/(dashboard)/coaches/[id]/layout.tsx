import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/server-session";
import { getCoachById } from "@/lib/services/coachService";
import { CoachDetailNav } from "@/components/coaches/CoachDetailNav";

export default async function CoachDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();
  const coach = await getCoachById(id, session!.user.id);

  if (!coach) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center text-2xl">
            {coach.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-brown">{coach.name}</h1>
            <p className="text-sm text-warm-brown">{coach.tone}</p>
          </div>
        </div>
        <CoachDetailNav coachId={id} />
      </div>
      {children}
    </div>
  );
}
