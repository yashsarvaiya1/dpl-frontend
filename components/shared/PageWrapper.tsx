// components/shared/PageWrapper.tsx

import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "max-w-md mx-auto px-4 pt-16 pb-20 min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}
