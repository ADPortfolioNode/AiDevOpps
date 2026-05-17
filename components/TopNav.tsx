'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';
import { useModelContext } from '@/lib/modelContext';

export function TopNav() {
  const pathname = usePathname();
  const { selectedModel, setSelectedModel } = useModelContext();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Workflows', href: '/workflows', icon: '🌊' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-panel px-6 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
          AiDevOpps
        </Link>

        {/* Model Switcher UI */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-full px-3 py-1.5 transition-colors hover:border-white/10 group">
          <label htmlFor="model-select" className="text-[10px] font-bold tracking-widest text-slate-500 uppercase group-hover:text-slate-400 transition-colors">
            Engine
          </label>
          <select 
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="bg-transparent text-blue-400 focus:outline-none cursor-pointer text-[10px] font-bold uppercase tracking-tight"
          >
            <option value="gpt-4o-mini" className="bg-[#0f172a] text-slate-100">GPT-4o-mini</option>
            <option value="llama-local" className="bg-[#0f172a] text-slate-100">Llama (Local)</option>
          </select>
        </div>
      </div>

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