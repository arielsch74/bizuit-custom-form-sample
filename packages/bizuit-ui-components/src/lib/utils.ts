/**
 * Utility functions for Bizuit UI Components
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date with locale support
 */
export function formatDate(date: Date, locale: string = 'es-AR'): string {
  return new Intl.DateTimeFormat(locale).format(date)
}

/**
 * Format number with locale support
 */
export function formatNumber(value: number, locale: string = 'es-AR'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'bizuit'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Check if device has touch support
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  )
}
