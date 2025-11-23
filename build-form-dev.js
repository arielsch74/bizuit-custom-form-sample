#!/usr/bin/env node

/**
 * Development Build Script for Bizuit Custom Forms
 * Creates a "fat" bundle that includes all dependencies for standalone dev.html testing
 * Unlike build-form.js, this DOES NOT mark Bizuit packages as external
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  entryPoint: process.argv[2] || './src/index.tsx',
  outfile: process.argv[3] || './dist/form.dev.js',
  formName: process.argv[4] || 'custom-form',
};

console.log('🔨 Building Bizuit Custom Form (DEV - Fat Bundle)...');
console.log(`📄 Entry: ${config.entryPoint}`);
console.log(`📦 Output: ${config.outfile}`);
console.log(`🏷️  Name: ${config.formName}`);

async function buildFormDev() {
  try {
    // Ensure dist directory exists
    const distDir = path.dirname(config.outfile);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Plugin to replace React imports with global references
    const globalReactPlugin = {
      name: 'global-react',
      setup(build) {
        // Intercept react imports
        build.onResolve({ filter: /^react$/ }, args => {
          return { path: args.path, namespace: 'global-react' }
        })

        build.onResolve({ filter: /^react-dom$/ }, args => {
          return { path: args.path, namespace: 'global-react' }
        })

        build.onResolve({ filter: /^react\/jsx-runtime$/ }, args => {
          return { path: args.path, namespace: 'global-react' }
        })

        build.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, args => {
          return { path: args.path, namespace: 'global-react' }
        })

        // Return global references as ES module exports
        build.onLoad({ filter: /.*/, namespace: 'global-react' }, args => {
          const contents = args.path === 'react'
            ? `
              const React = window.React;
              export default React;
              export const useState = React.useState;
              export const useEffect = React.useEffect;
              export const useContext = React.useContext;
              export const createContext = React.createContext;
              export const useCallback = React.useCallback;
              export const useMemo = React.useMemo;
              export const useRef = React.useRef;
              export const useReducer = React.useReducer;
              export const useLayoutEffect = React.useLayoutEffect;
              export const Fragment = React.Fragment;
              export const createElement = React.createElement;
              export const forwardRef = React.forwardRef;
              export const Children = React.Children;
              export const isValidElement = React.isValidElement;
              export const cloneElement = React.cloneElement;
              export const Component = React.Component;
              export const PureComponent = React.PureComponent;
              export const memo = React.memo;
              export const lazy = React.lazy;
              export const Suspense = React.Suspense;
            `
            : args.path === 'react-dom'
            ? `
              const ReactDOM = window.ReactDOM;
              export default ReactDOM;
              export const createRoot = ReactDOM.createRoot;
              export const render = ReactDOM.render;
              export const flushSync = ReactDOM.flushSync;
            `
            : args.path.includes('jsx-runtime')
            ? `
              export const jsx = window.React.createElement;
              export const jsxs = window.React.createElement;
              export const Fragment = window.React.Fragment;
            `
            : ''

          return {
            contents,
            loader: 'js',
          }
        })
      },
    }

    const result = await esbuild.build({
      entryPoints: [config.entryPoint],
      bundle: true,
      format: 'esm', // ES Module format for dynamic import()
      outfile: config.outfile,
      platform: 'browser',
      target: ['es2020'],
      minify: false, // Don't minify for easier debugging
      sourcemap: true,

      // Bundle Bizuit packages, but keep React external
      external: [],

      // Use plugin for React
      plugins: [globalReactPlugin],

      // Replace React imports with global references
      banner: {
        js: `
/* Bizuit Custom Form: ${config.formName} (DEV BUILD - FAT BUNDLE) */
/* Built: ${new Date().toISOString()} */
/* React: window.React (external via plugin) */
/* ReactDOM: window.ReactDOM (external via plugin) */
/* Bizuit Packages: BUNDLED */
        `.trim(),
      },

      // Use classic JSX runtime to avoid jsx-runtime imports
      jsx: 'transform',
      jsxFactory: 'window.React.createElement',
      jsxFragment: 'window.React.Fragment',

      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
        '.css': 'css',
        '.json': 'json',
      },

      logLevel: 'info',
    });

    // Get output file size
    const stats = fs.statSync(config.outfile);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Build successful!');
    console.log(`📊 Size: ${sizeKB} KB (FAT - includes all dependencies)`);

    if (result.warnings.length > 0) {
      console.warn('⚠️  Warnings:');
      result.warnings.forEach(warning => console.warn(warning));
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Build failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run build
buildFormDev();
