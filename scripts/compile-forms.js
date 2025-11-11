#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const FORMS_DIR = path.join(__dirname, '..', 'forms');
const OUTPUT_DIR = path.join(__dirname, '..', 'dist');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compileForm(formPath) {
  const formName = path.basename(formPath, path.extname(formPath));
  const outputPath = path.join(OUTPUT_DIR, `${formName}.js`);

  console.log(`Compiling ${formName}...`);

  try {
    await esbuild.build({
      entryPoints: [formPath],
      bundle: true,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      outfile: outputPath,
      external: ['react', 'react-dom'],
      logLevel: 'info',
      minify: true,
      sourcemap: false,
    });

    console.log(`✅ Successfully compiled ${formName}`);
    return { success: true, formName, outputPath };
  } catch (error) {
    console.error(`❌ Failed to compile ${formName}:`, error.message);
    return { success: false, formName, error: error.message };
  }
}

async function compileAllForms() {
  console.log('🚀 Starting form compilation...\n');

  // Get all .tsx files from forms directory
  const formFiles = fs
    .readdirSync(FORMS_DIR)
    .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx'));

  if (formFiles.length === 0) {
    console.log('⚠️  No form files found in forms/ directory');
    return;
  }

  const results = [];

  for (const formFile of formFiles) {
    const formPath = path.join(FORMS_DIR, formFile);
    const result = await compileForm(formPath);
    results.push(result);
  }

  console.log('\n📊 Compilation Summary:');
  console.log(`Total forms: ${results.length}`);
  console.log(`Successful: ${results.filter((r) => r.success).length}`);
  console.log(`Failed: ${results.filter((r) => !r.success).length}`);

  if (results.some((r) => !r.success)) {
    process.exit(1);
  }
}

// Check for watch mode
const watchMode = process.argv.includes('--watch') || process.argv.includes('-w');

if (watchMode) {
  console.log('👀 Watch mode enabled. Watching for changes...\n');

  fs.watch(FORMS_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.jsx'))) {
      console.log(`\n🔄 Detected change in ${filename}, recompiling...`);
      const formPath = path.join(FORMS_DIR, filename);
      compileForm(formPath);
    }
  });

  // Initial compilation
  compileAllForms();
} else {
  compileAllForms().catch((error) => {
    console.error('❌ Compilation failed:', error);
    process.exit(1);
  });
}
