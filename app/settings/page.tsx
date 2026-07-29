"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUsername, updatePassword, logoutUser } from "@/app/actions";
import { User, Lock, LogOut, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAppDialog } from "@/components/ui/app-dialog";

export default function SettingsPage() {
  const dialog = useAppDialog();
  const [isPending, startTransition] = useTransition();

  // Username form state
  const [usernameInput, setUsernameInput] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usernameInput || usernameInput.trim().length < 3) {
      dialog.showAlert("Invalid Username", "Username must be at least 3 characters long.");
      return;
    }

    startTransition(async () => {
      try {
        await updateUsername(usernameInput.trim());
        await dialog.showSuccess("Username Updated", `Your admin username has been changed to "${usernameInput.trim()}".`);
        setUsernameInput("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update username.";
        await dialog.showAlert("Error", message);
      }
    });
  };

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dialog.showAlert("Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 4) {
      dialog.showAlert("Weak Password", "New password must be at least 4 characters long.");
      return;
    }

    startTransition(async () => {
      try {
        await updatePassword(currentPassword, newPassword);
        await dialog.showSuccess("Password Updated", "Your password has been changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update password.";
        await dialog.showAlert("Error", message);
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <div className="px-4 pt-4 pb-8 max-w-lg mx-auto md:max-w-xl md:px-8 md:pt-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-outfit text-slate-900">Account Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your credentials and security.</p>
      </div>

      {/* Change Username Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-50 p-2.5 rounded-2xl">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit">Change Username</h3>
            <p className="text-[11px] text-slate-400">Update your admin login username</p>
          </div>
        </div>

        <form onSubmit={handleUpdateUsername} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="newUsername" className="text-xs font-semibold text-slate-600">New Username</Label>
            <Input
              id="newUsername"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter new username"
              required
              className="rounded-xl bg-slate-50 border-slate-200 h-10 text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isPending ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-50 p-2.5 rounded-2xl">
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit">Change Password</h3>
            <p className="text-[11px] text-slate-400">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-600">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="rounded-xl bg-slate-50 border-slate-200 h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-600">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="rounded-xl bg-slate-50 border-slate-200 h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="rounded-xl bg-slate-50 border-slate-200 h-10 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Logout Card */}
      <div className="bg-white rounded-3xl border border-red-100 p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-red-600">Sign Out</p>
          <p className="text-[11px] text-slate-400">End your current session</p>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isPending}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-9 text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          {isPending ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
