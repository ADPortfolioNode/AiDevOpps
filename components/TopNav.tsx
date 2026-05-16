'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';

export function TopNav() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Workflows', href: '/workflows', icon: '🌊' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-panel px-6 py-3 sticky top-0 z-20">
      <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
        AiDevOpps
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}