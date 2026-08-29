import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const title = "Sign in or Create Account | Zenith";
const description =
  "Sign in to your Zenith account or create a new one with email or Google. Your session stays active across refreshes.";

export const Route = createFileRoute("/")({
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
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setNotice(null);
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: String(form.get("name")) },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setNotice("Check your email to confirm your account, then sign in.");
    toast.success("Almost there — confirm your email to finish signing up.");
  };

  const handleReset = async () => {
    const email = window.prompt("Enter the email for your account:");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent — check your inbox.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  const googleButton = (
    <div className="auth-social-row">
      <button
        type="button"
        aria-label="Continue with Google"
        className="auth-social"
        onClick={handleGoogle}
        disabled={busy}
      >
        <Chrome size={16} aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <main className="auth-page">
      <h1 className="sr-only">Sign in or create your Zenith account</h1>

      <div className="auth-card" data-panel={panel}>
        <div className="auth-form-container auth-signup">
          <form className="auth-form" onSubmit={handleSignUp}>
            <h2 className="auth-title">Create Account</h2>
            {googleButton}
            <span className="auth-hint">or use your email for registration</span>
            <input className="auth-input" name="name" type="text" placeholder="Name" required />
            <input className="auth-input" name="email" type="email" placeholder="Email" required />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="Password"
              minLength={6}
              required
            />
            <button className="auth-btn" type="submit" disabled={busy}>
              {busy ? "Please wait…" : "Sign Up"}
            </button>
            <p className="auth-mobile-switch">
              Already have an account?{" "}
              <button type="button" onClick={() => setPanel("signin")}>
                Sign in
              </button>
            </p>
          </form>
        </div>

        <div className="auth-form-container auth-signin">
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2 className="auth-title">Sign in</h2>
            {googleButton}
            <span className="auth-hint">or use your account</span>
            <input className="auth-input" name="email" type="email" placeholder="Email" required />
            <input
              className="auth-input"
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <button className="auth-link" type="button" onClick={handleReset}>
              Forgot your password?
            </button>
            <button className="auth-btn" type="submit" disabled={busy}>
              {busy ? "Please wait…" : "Sign In"}
            </button>
            <p className="auth-mobile-switch">
              New here?{" "}
              <button type="button" onClick={() => setPanel("signup")}>
                Create account
              </button>
            </p>
          </form>
        </div>

        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h2 className="auth-title">Welcome Back!</h2>
              <p className="auth-overlay-copy">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="auth-btn auth-btn-ghost"
                type="button"
                onClick={() => setPanel("signin")}
              >
                Sign In
              </button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h2 className="auth-title">Hello, Friend!</h2>
              <p className="auth-overlay-copy">
                Enter your personal details and start journey with us
              </p>
              <button
                className="auth-btn auth-btn-ghost"
                type="button"
                onClick={() => setPanel("signup")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <p role="status" className="auth-hint">
          {notice}
        </p>
      ) : null}
    </main>
  );
}
