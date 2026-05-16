'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Option = { value: string; label: string };

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  disabled = false,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on outside pointer (mouse + touch)
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: PointerEvent) {
      if (
        btnRef.current  && !btnRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [open]);

  // Reposition on scroll; close only if button leaves viewport. Close on resize.
  useEffect(() => {
    if (!open) return;
    function handleScroll(e: Event) {
      if (listRef.current && listRef.current.contains(e.target as Node)) return;
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        setOpen(false);
      } else {
        setRect(r);
      }
    }
    const handleResize = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  function updateRect() {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
  }

  function toggle() {
    if (disabled) return;
    if (!open) updateRect();
    setOpen((o) => !o);
  }

  const selected     = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;
  const hasValue     = !!selected;

  const viewportHeight =
    typeof window !== 'undefined'
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 600;

  const dropdownStyle: React.CSSProperties = rect ? (() => {
    const spaceBelow = viewportHeight - rect.bottom;
    const dropH      = Math.min(options.length * 44 + 8, 240);
    const openUp     = spaceBelow < dropH + 8 && rect.top > dropH + 8;
    return {
      position: 'fixed',
      left:     rect.left,
      width:    rect.width,
      zIndex:   99999,
      ...(openUp
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top:    rect.bottom + 4 }),
    };
  })() : {};

  const dropdown = open && rect ? (
    <div
      ref={listRef}
      style={dropdownStyle}
      className="bg-white rounded-xl border border-slate-200 shadow-xl py-1 overflow-y-auto max-h-60"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-2
              ${isSelected
                ? 'bg-red-50 text-red-600 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            {isSelected ? (
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-3.5 flex-shrink-0" />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`w-full h-11 flex items-center justify-between gap-2 rounded-xl border px-4 text-sm font-semibold transition
          focus:outline-none focus:ring-4 focus:ring-red-100
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' : 'bg-white cursor-pointer'}
          ${open
            ? 'border-red-400 ring-4 ring-red-100 bg-white'
            : hasValue
              ? 'border-slate-200 text-slate-900 hover:border-red-300'
              : 'border-slate-200 text-slate-400 hover:border-red-300'
          }`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180 text-red-400' : 'text-slate-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {typeof document !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
