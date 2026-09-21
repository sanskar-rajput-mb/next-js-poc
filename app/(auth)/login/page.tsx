import LoginForm from "@/components/login-form";
import { clinicians } from "@/lib/data";
import { safeRedirect } from "@/lib/session";

export const metadata = { title: "Sign in" };

// middleware.ts sends signed-out visitors here with ?from=/where/they/were,
// so after signing in they land back on the page they asked for.
type Props = { searchParams: Promise<{ from?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { from } = await searchParams;

  return (
    <div className="auth-card">
      <LoginForm clinicians={clinicians} from={safeRedirect(from)} />
    </div>
  );
}
