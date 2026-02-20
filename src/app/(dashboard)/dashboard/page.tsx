import { getServerSession } from "@/lib/auth/server-session";
import { getCoachesByUser } from "@/lib/services/coachService";
import { CreateCoachForm } from "@/components/dashboard/CreateCoachForm";
import { CoachList } from "@/components/dashboard/CoachList";

export default async function DashboardPage() {
  const session = await getServerSession();
  const coaches = await getCoachesByUser(session!.user.id);

  return (
    <div>
      <div className="mb-10">
        <p className="text-sm font-semibold tracking-widest text-accent-orange uppercase mb-4">
          + AI Coach Builder
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-dark-brown leading-tight">
          Build an <span className="text-accent-orange italic">AI coach</span>{" "}
          in 30
          <br />
          seconds flat.
        </h1>
        <p className="text-warm-brown text-lg mt-4 max-w-xl">
          Describe your coach in plain English. Get an embed code. Drop it
          anywhere. Done.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CreateCoachForm />
        <CoachList initialCoaches={coaches} />
      </div>
    </div>
  );
}
