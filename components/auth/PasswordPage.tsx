// components/auth/PasswordPage.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import GuestGuard from "@/components/shared/GuestGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

function PasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mobile = searchParams.get("mobile") || "";
  const hasPassword = searchParams.get("hasPassword") === "true";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mobile) router.replace("/login");
  }, [mobile, router]);

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: () => authService.login(mobile, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      router.replace("/");
    },
    onError: () => setError("Incorrect password. Please try again."),
  });

  const { mutate: setPasswordMutation, isPending: isSetPending } = useMutation({
    mutationFn: () =>
      authService.setPassword(mobile, password, confirmPassword),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      router.replace("/");
    },
    onError: () => setError("Failed to set password. Please try again."),
  });

  const isPending = isLoginPending || isSetPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!hasPassword && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (hasPassword) {
      login();
    } else {
      setPasswordMutation();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto px-6">
      <div className="w-full space-y-8">
        <div className="space-y-2">
          <button
            onClick={() => router.replace("/login")}
            className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold tracking-tight">
            {hasPassword ? "Enter Password" : "Create Password"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {hasPassword
              ? `Welcome back! Enter your password for ${mobile}`
              : `Set a new password for ${mobile}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">
              {hasPassword ? "Password" : "New Password"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base pr-12"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isPending || !password.trim()}
          >
            {isPending
              ? "Please wait..."
              : hasPassword
              ? "Login"
              : "Set Password & Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function PasswordPage() {
  return (
    <GuestGuard>
      <PasswordForm />
    </GuestGuard>
  );
}
