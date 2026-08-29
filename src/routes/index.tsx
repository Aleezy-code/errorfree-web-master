import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Facebook, Linkedin, Chrome } from "lucide-react";

const title = "Sign in or Create Account | Zenith";
const description =
  "Sign in to your Zenith account or create a new one with the sliding sign in and sign up form.";

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

const socials = [
  { label: "Continue with Facebook", Icon: Facebook },
  { label: "Continue with Google", Icon: Chrome },
  { label: "Continue with LinkedIn", Icon: Linkedin },
];

function SocialRow() {
  return (
    <div className="auth-social-row">
      {socials.map(({ label, Icon }) => (
        <button key={label} type="button" aria-label={label} className="auth-social">
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function AuthPage() {
  const [panel, setPanel] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);

  const submit = (kind: string) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(`${kind} submitted — connect a backend to make this live.`);
  };

  return (
    <main className="auth-page">
      <h1 className="sr-only">Sign in or create your Zenith account</h1>

      <div className="auth-card" data-panel={panel}>
        <div className="auth-form-container auth-signup">
          <form className="auth-form" onSubmit={submit("Sign up")}>
            <h2 className="auth-title">Create Account</h2>
            <SocialRow />
            <span className="auth-hint">or use your email for registration</span>
            <input className="auth-input" type="text" placeholder="Name" required />
            <input className="auth-input" type="email" placeholder="Email" required />
            <input className="auth-input" type="password" placeholder="Password" required />
            <button className="auth-btn" type="submit">
              Sign Up
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
          <form className="auth-form" onSubmit={submit("Sign in")}>
            <h2 className="auth-title">Sign in</h2>
            <SocialRow />
            <span className="auth-hint">or use your account</span>
            <input className="auth-input" type="email" placeholder="Email" required />
            <input className="auth-input" type="password" placeholder="Password" required />
            <a className="auth-link" href="#reset">
              Forgot your password?
            </a>
            <button className="auth-btn" type="submit">
              Sign In
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

      {message ? (
        <p role="status" className="auth-hint">
          {message}
        </p>
      ) : null}
    </main>
  );
}
