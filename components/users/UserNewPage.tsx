// components/users/UserNewPage.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useCreateUser } from "@/hooks/useUser";
import PageWrapper from "@/components/shared/PageWrapper";
import UserForm from "./UserForm";

export default function UserNewPage() {
  const router = useRouter();
  const setHeaderTitle = useUiStore((s) => s.setHeaderTitle);
  const { mutate: createUser, isPending, error } = useCreateUser();
  const setShowBack = useUiStore((s) => s.setShowBack);

  useEffect(() => {
    setHeaderTitle("New User");
    setShowBack(true);
    return () => setShowBack(false);
  }, [setHeaderTitle, setShowBack]);

  return (
    <PageWrapper>
      <UserForm
        isPending={isPending}
        error={
          error
            ? (error as any)?.response?.data?.mobile_number?.[0] ||
              "Failed to create user."
            : undefined
        }
        onSubmit={(data) => {
          createUser(data as any, {
            onSuccess: () => router.replace("/users"),
          });
        }}
      />
    </PageWrapper>
  );
}
