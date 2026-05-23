import Link from "next/link";
import LoginForm from "./LoginForm";
import { getAdminSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-16 text-[#111827]">
      <div className="mx-auto flex w-full max-w-[460px] flex-col items-center">
        <Link href="/" className="mb-8 text-sm font-bold text-[#ef3338]">
          ← Back to JPSPARE
        </Link>
        <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-[#ef3338] text-2xl font-black text-white shadow-lg">
          JS
        </div>
        <h1 className="text-center text-4xl font-black tracking-[-0.04em]">
          Admin <span className="text-[#ef3338]">Login</span>
        </h1>
        <p className="mt-3 text-center text-sm text-[#667085]">
          Secure access for CMS, catalog, content, and future ERP/BMS operations.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
