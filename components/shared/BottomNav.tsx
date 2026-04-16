// components/shared/BottomNav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { label: "Home", href: "/", icon: Home, adminOnly: false },
  { label: "Users", href: "/users", icon: Users, adminOnly: true },
  { label: "Profile", href: "/profile", icon: User, adminOnly: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isSuperUser = useAuthStore((s) => s.isSuperUser);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const canSeeAdmin = isSuperUser() || isAdmin();

  const navItems = baseNavItems.filter(
    (item) => !item.adminOnly || canSeeAdmin
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 max-w-md mx-auto">
      <nav className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 min-h-12 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
