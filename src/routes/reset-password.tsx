import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const title = "Set a new password | Zenith";
const description = "Choose a new password for your Zenith account.";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={submit}>
        <h1 className="auth-title">New password</h1>
        <span className="auth-hint">Enter a new password for your account</span>
        <input
          className="auth-input"
          name="password"
          type="password"
          placeholder="New password"
          minLength={6}
          required
        />
        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
