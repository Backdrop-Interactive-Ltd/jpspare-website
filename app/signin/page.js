import SignInPageClient from "./SignInPageClient";
import { Header } from "../homepage/site-header";

export const metadata = {
  title: "Sign In | JPSPARE",
  description: "Sign in to your JPSPARE account.",
};

export default function SignInPage() {
  return (
    <>
      <Header />
      <SignInPageClient />
    </>
  );
}
