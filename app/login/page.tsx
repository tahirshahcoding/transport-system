"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions";
import { Lock, User, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100/20">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 relative mb-4 flex items-center justify-center bg-slate-50 rounded-2xl p-2 shadow-inner border border-slate-100">
            <Image
              src="/logo.png"
              alt="Transport System Logo"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to access the Transport System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="username"
                placeholder="Enter admin username"
                defaultValue="admin"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                defaultValue="admin123"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          Default: <span className="font-mono text-slate-600 font-semibold">admin</span> / <span className="font-mono text-slate-600 font-semibold">admin123</span>
        </p>
      </div>
    </div>
  );
}
