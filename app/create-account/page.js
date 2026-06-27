import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Account | JPSPARE",
  description: "Continue with OTP to access your JPSPARE account.",
};

function getSafeRedirectPath(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();
  if (!trimmedValue.startsWith("/") || trimmedValue.startsWith("//")) {
    return "";
  }

  return trimmedValue;
}

export default async function CreateAccountPage({ searchParams }) {
  const params = await searchParams;
  const safeRedirectPath = getSafeRedirectPath(params?.redirect);
  const signinPath = safeRedirectPath ? `/signin?redirect=${encodeURIComponent(safeRedirectPath)}` : "/signin";

  redirect(signinPath);
}
