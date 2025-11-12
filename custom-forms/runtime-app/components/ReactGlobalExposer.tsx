'use client'

import { useEffect } from 'react'
import React from 'react'
import ReactDOM from 'react-dom'

/**
 * ReactGlobalExposer Component
 *
 * Exposes React and ReactDOM globally so dynamically loaded forms
 * can use the same React instance as the runtime app.
 *
 * This solves the React singleton problem when loading forms dynamically.
 */
export function ReactGlobalExposer() {
  useEffect(() => {
    // Expose React and ReactDOM globally
    if (typeof window !== 'undefined') {
      (window as any).React = React;
      (window as any).ReactDOM = ReactDOM;
      (window as any).__REACT_READY__ = true;

      console.log('[ReactGlobalExposer] ✅ React exposed globally');
      console.log('[ReactGlobalExposer] React version:', React.version);
    }

    return () => {
      // Cleanup on unmount (optional)
      if (typeof window !== 'undefined') {
        (window as any).__REACT_READY__ = false;
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
