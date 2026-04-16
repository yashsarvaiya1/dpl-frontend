// components/shared/BottomNav.tsx

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Home, Trophy, Ticket, Receipt, User, Plus, X, Users, CalendarDays, LayoutGrid } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// Normal user nav — 4 items + FAB center
const userNavLeft = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/bmatches', label: 'Matches', icon: Trophy },
]
const userNavRight = [
  { href: '/rooms', label: 'My Rooms', icon: Ticket },
  { href: '/profile', label: 'Profile', icon: User },
]

// Admin nav — 4 items + FAB center
const adminNavLeft = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/bmatches', label: 'BMatches', icon: Trophy },
]
const adminNavRight = [
  { href: '/transactions', label: 'Tickets', icon: Receipt },
  { href: '/profile', label: 'Profile', icon: User },
]

// FAB options per role
const userFabOptions = [
  { href: '/transactions', label: 'History', icon: Receipt },
  { href: '/rooms', label: 'My Rooms', icon: Ticket },
]

const adminFabOptions = [
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/matches', label: 'Matches', icon: CalendarDays },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/bmatches/new', label: 'New BMatch', icon: LayoutGrid },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = useAuthStore(s => s.isAdmin())
  const isSuperUser = useAuthStore(s => s.isSuperUser())
  const [fabOpen, setFabOpen] = useState(false)

  const isElevated = isAdmin || isSuperUser
  const navLeft = isElevated ? adminNavLeft : userNavLeft
  const navRight = isElevated ? adminNavRight : userNavRight
  const fabOptions = isElevated ? adminFabOptions : userFabOptions

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'))

  return (
    <>
      {/* FAB Overlay */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* FAB Options */}
      {fabOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {fabOptions.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => { router.push(href); setFabOpen(false) }}
              className="flex items-center gap-3 bg-background border rounded-full px-5 py-2.5 shadow-lg text-sm font-medium min-h-11"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">

          {/* Left nav items */}
          {navLeft.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-h-12 justify-center',
                'text-xs transition-colors flex-1',
                isActive(href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}

          {/* FAB Center Button */}
          <button
            onClick={() => setFabOpen(prev => !prev)}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full shadow-lg mx-2 transition-all',
              fabOpen
                ? 'bg-destructive text-destructive-foreground rotate-45'
                : 'bg-primary text-primary-foreground'
            )}
          >
            {fabOpen ? <X size={22} /> : <Plus size={22} />}
          </button>

          {/* Right nav items */}
          {navRight.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-h-12 justify-center',
                'text-xs transition-colors flex-1',
                isActive(href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}

        </div>
      </nav>
    </>
  )
}
