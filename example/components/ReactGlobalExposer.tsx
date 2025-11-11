'use client'

import { useEffect } from 'react'
import * as React from 'react'

/**
 * This component exposes React globally for dynamically loaded forms.
 * It MUST be rendered early in the component tree.
 */
export function ReactGlobalExposer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose React and all hooks globally
      ;(window as any).React = React
      ;(window as any).__REACT_READY__ = true

      console.log('[ReactGlobalExposer] ✅ React exposed globally:', {
        React: !!window.React,
        useState: !!React.useState,
        useEffect: !!React.useEffect,
        createElement: !!React.createElement,
      })
    }
  }, [])

  return null // This component doesn't render anything
}
