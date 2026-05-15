'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export function TopNav() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Workflows', href: '/workflows', icon: '🌊' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-panel px-6 py-3 sticky top-0 z-10">
      <div className="text-2xl font-bold text-white">Concierge</div>
      <nav className="flex items-center gap-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}