'use client'

import { useEffect } from 'react'
import React from 'react'
import ReactDOM from 'react-dom'
import * as BizuitFormSDK from '@tyconsa/bizuit-form-sdk'
import * as BizuitUIComponents from '@tyconsa/bizuit-ui-components'

/**
 * ReactGlobalExposer Component
 *
 * Exposes React, ReactDOM, and BIZUIT packages globally so dynamically loaded forms
 * can use the same instances as the runtime app.
 *
 * This solves the React singleton problem and allows forms to use shared dependencies
 * without bundling them into each compiled form.
 *
 * Exposed globals:
 * - window.React
 * - window.ReactDOM
 * - window.BizuitFormSDK (@tyconsa/bizuit-form-sdk)
 * - window.BizuitUIComponents (@tyconsa/bizuit-ui-components)
 */
export function ReactGlobalExposer() {
  useEffect(() => {
    // Expose React, ReactDOM, and BIZUIT packages globally
    if (typeof window !== 'undefined') {
      // Core React libraries
      (window as any).React = React;
      (window as any).ReactDOM = ReactDOM;

      // BIZUIT packages
      (window as any).BizuitFormSDK = BizuitFormSDK;
      (window as any).BizuitUIComponents = BizuitUIComponents;

      (window as any).__REACT_READY__ = true;

      console.log('[ReactGlobalExposer] ✅ React exposed globally');
      console.log('[ReactGlobalExposer] React version:', React.version);
      console.log('[ReactGlobalExposer] ✅ BIZUIT packages exposed globally');
      console.log('[ReactGlobalExposer] - BizuitFormSDK:', Object.keys(BizuitFormSDK).length, 'exports');
      console.log('[ReactGlobalExposer] - BizuitUIComponents:', Object.keys(BizuitUIComponents).length, 'exports');
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
