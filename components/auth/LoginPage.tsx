// components/auth/LoginPage.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import GuestGuard from "@/components/shared/GuestGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginForm() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const { mutate: checkMobile, isPending } = useMutation({
    mutationFn: () => authService.checkMobile(mobile),
    onSuccess: (data) => {
      if (!data.exists) {
        setError("No account found with this mobile number.");
        return;
      }
      if (!data.is_active) {
        setError("Your account has been deactivated. Contact admin.");
        return;
      }
      const params = new URLSearchParams({
        mobile,
        hasPassword: String(data.has_password_set),
      });
      router.push(`/password?${params.toString()}`);
    },
    onError: () => {
      setError("No account found with this mobile number.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!mobile.trim()) return;
    checkMobile();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto px-6">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">DPL</h1>
          <p className="text-muted-foreground text-sm">
            Enter your mobile number to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="h-12 text-base"
              autoFocus
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isPending || !mobile.trim()}
          >
            {isPending ? "Checking..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
