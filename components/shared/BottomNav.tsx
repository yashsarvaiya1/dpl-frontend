// components/shared/BottomNav.tsx

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Home, Trophy, Ticket, Receipt, User,
  Plus, X, Users, CalendarDays, LayoutGrid, DoorOpen
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const userNavLeft = [
  { href: '/',         label: 'Home',    icon: Home },
  { href: '/bmatches', label: 'Matches', icon: Trophy },
]
const userNavRight = [
  { href: '/rooms',   label: 'My Rooms', icon: Ticket },
  { href: '/profile', label: 'Profile',  icon: User },
]

const adminNavLeft = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/bmatches', label: 'BMatches', icon: Trophy },
]
const adminNavRight = [
  { href: '/transactions', label: 'Tickets', icon: Receipt },
  { href: '/profile',      label: 'Profile', icon: User },
]

const userFabOptions = [
  { href: '/transactions', label: 'Ticket History', icon: Receipt },
]

const adminFabOptions = [
  { href: '/rooms',        label: 'My Rooms',    icon: DoorOpen },
  { href: '/users',        label: 'Users',        icon: Users },
  { href: '/teams',        label: 'Teams',        icon: Users },
  { href: '/matches',      label: 'Matches',      icon: CalendarDays },
  { href: '/bmatches/new', label: 'New BMatch',   icon: LayoutGrid },
]

export default function BottomNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const isElevated = useAuthStore(s => s.isElevated())
  const [fabOpen, setFabOpen] = useState(false)

  const navLeft    = isElevated ? adminNavLeft    : userNavLeft
  const navRight   = isElevated ? adminNavRight   : userNavRight
  const fabOptions = isElevated ? adminFabOptions : userFabOptions

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────── */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* ── FAB Options Drawer ───────────────────────────────── */}
      <div
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2',
          'transition-all duration-300',
          fabOpen
            ? 'bottom-19 opacity-100 pointer-events-auto'
            : 'bottom-16 opacity-0 pointer-events-none'
        )}
      >
        {/* Floating card container */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden min-w-50">
          {fabOptions.map(({ href, label, icon: Icon }, index) => (
            <button
              key={href}
              onClick={() => { router.push(href); setFabOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium',
                'hover:bg-accent transition-colors text-left',
                'active:scale-95',
                index !== 0 && 'border-t border-border'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={14} />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Arrow pointer */}
        <div className="w-3 h-3 bg-card border-r border-b border-border rotate-45 -mt-2 shadow-sm" />
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────── */}
      <nav className="h-16 bg-background/95 backdrop-blur-sm border-t border-border shrink-0 z-50 safe-area-pb">
        <div className="max-w-md mx-auto flex items-center h-16">

          {navLeft.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'text-[10px] font-medium transition-colors',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-6 rounded-full transition-all',
                isActive(href) ? 'bg-primary/10' : ''
              )}>
                <Icon size={isActive(href) ? 20 : 18} />
              </div>
              <span>{label}</span>
            </Link>
          ))}

          {/* FAB */}
          <div className="flex items-center justify-center w-16 shrink-0">
            <button
              onClick={() => setFabOpen(prev => !prev)}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full shadow-lg',
                'transition-all duration-200 active:scale-90',
                fabOpen
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <Plus
                size={22}
                className={cn('transition-transform duration-200', fabOpen && 'rotate-45')}
              />
            </button>
          </div>

          {navRight.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'text-[10px] font-medium transition-colors',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-6 rounded-full transition-all',
                isActive(href) ? 'bg-primary/10' : ''
              )}>
                <Icon size={isActive(href) ? 20 : 18} />
              </div>
              <span>{label}</span>
            </Link>
          ))}

        </div>
      </nav>
    </>
  )
}
