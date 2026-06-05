import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";
  return <RegisterForm siteKey={siteKey} />;
}

