import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const title = "Your account | Zenith";
const description = "Your signed-in Zenith account overview.";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      return { email: user.email ?? "", fullName: profile?.full_name ?? null };
    },
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <h1 className="auth-title">
          Welcome{data?.fullName ? `, ${data.fullName.split(" ")[0]}` : ""}!
        </h1>
        <p className="auth-overlay-copy" style={{ color: "var(--auth-ink)" }}>
          You're signed in{data?.email ? ` as ${data.email}` : ""}. Your session persists across
          refreshes.
        </p>
        <button className="auth-btn" type="button" onClick={signOut}>
          Sign Out
        </button>
      </div>
    </main>
  );
}
