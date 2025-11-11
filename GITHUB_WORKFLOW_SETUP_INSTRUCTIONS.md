# Instrucciones para Agregar el GitHub Actions Workflow

## Problema

El token de GitHub CLI no tiene el scope `workflow`, por lo que no puede pushear archivos de workflows automáticamente. Necesitás agregarlo manualmente desde la interfaz web de GitHub.

## Estado Actual

✅ **Repositorio creado:** https://github.com/arielsch74/bizuit-custom-form-sample
✅ **package-lock.json agregado:** Pusheado exitosamente
✅ **Forms de ejemplo:** employee-leave-request.tsx, purchase-order-approval.tsx
✅ **Scripts de compilación:** compile-forms.js, publish-forms.js

❌ **Workflow de GitHub Actions:** Necesita ser agregado manualmente

---

## Opción 1: Agregar Workflow desde GitHub Web UI (Recomendado)

### Paso 1: Ir al Repositorio

1. Abrí https://github.com/arielsch74/bizuit-custom-form-sample
2. Click en la pestaña **"Actions"**
3. Click en **"New workflow"** o **"set up a workflow yourself"**

### Paso 2: Crear el Archivo del Workflow

1. GitHub te va a crear automáticamente el path: `.github/workflows/main.yml`
2. Renombralo a: `.github/workflows/compile-and-publish.yml`
3. Pegá el siguiente contenido:

```yaml
name: Compile and Publish Custom Forms

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'forms/**'
  workflow_dispatch:

jobs:
  compile-and-publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Compile forms
        run: npm run build

      - name: Publish forms to API
        env:
          BIZUIT_API_URL: ${{ secrets.BIZUIT_API_URL }}
          BIZUIT_API_TOKEN: ${{ secrets.BIZUIT_API_TOKEN }}
          GITHUB_ACTOR: ${{ github.actor }}
        run: npm run publish:forms

      - name: Upload compiled forms as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: compiled-forms
          path: dist/
          retention-days: 30
```

### Paso 3: Commit del Workflow

1. Scroll down al botón **"Commit changes"**
2. Mensaje de commit sugerido: `ci: Add GitHub Actions workflow for form compilation`
3. Click en **"Commit changes"**

---

## Opción 2: Agregar Workflow Localmente (con Git)

Si preferís agregar el workflow localmente y pushearlo con git:

```bash
# Clonar el repo
cd /tmp
gh repo clone arielsch74/bizuit-custom-form-sample
cd bizuit-custom-form-sample

# Crear el directorio workflows
mkdir -p .github/workflows

# Crear el archivo del workflow
cat > .github/workflows/compile-and-publish.yml << 'EOF'
name: Compile and Publish Custom Forms

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'forms/**'
  workflow_dispatch:

jobs:
  compile-and-publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Compile forms
        run: npm run build

      - name: Publish forms to API
        env:
          BIZUIT_API_URL: ${{ secrets.BIZUIT_API_URL }}
          BIZUIT_API_TOKEN: ${{ secrets.BIZUIT_API_TOKEN }}
          GITHUB_ACTOR: ${{ github.actor }}
        run: npm run publish:forms

      - name: Upload compiled forms as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: compiled-forms
          path: dist/
          retention-days: 30
EOF

# Add, commit y push desde la web de GitHub
# (Ya que gh CLI no tiene permisos para workflows)
git add .github/workflows/compile-and-publish.yml
git commit -m "ci: Add GitHub Actions workflow for form compilation"

# Ahora necesitás pushear esto desde la web:
# 1. Ir a https://github.com/arielsch74/bizuit-custom-form-sample
# 2. Click en "Add file" → "Upload files"
# 3. Drag & drop el archivo .github/workflows/compile-and-publish.yml
```

---

## Paso 3: Configurar GitHub Secrets

Una vez que el workflow esté agregado, configurá los secrets:

1. Ir a https://github.com/arielsch74/bizuit-custom-form-sample/settings/secrets/actions
2. Click en **"New repository secret"**
3. Agregar los siguientes secrets:

### Secret 1: BIZUIT_API_URL
- **Name:** `BIZUIT_API_URL`
- **Value:** La URL de tu API Bizuit (ejemplo: `https://api.bizuit.com`)

### Secret 2: BIZUIT_API_TOKEN
- **Name:** `BIZUIT_API_TOKEN`
- **Value:** Tu token de autenticación de la API Bizuit

---

## Paso 4: Verificar el Workflow

### Probar manualmente:

1. Ir a https://github.com/arielsch74/bizuit-custom-form-sample/actions
2. Click en el workflow **"Compile and Publish Custom Forms"**
3. Click en **"Run workflow"** → **"Run workflow"**
4. Esperar que termine y verificar que:
   - ✅ Checkout repository: Success
   - ✅ Setup Node.js: Success
   - ✅ Install dependencies: Success
   - ✅ Compile forms: Success
   - ⚠️ Publish forms to API: Puede fallar si no configuraste los secrets todavía
   - ✅ Upload artifacts: Success

### Probar con push:

```bash
# En tu repo local
cd /tmp/bizuit-custom-form-sample

# Hacer un cambio en un form
echo "// Comment added" >> forms/employee-leave-request.tsx

# Commit y push
git add forms/
git commit -m "test: Trigger workflow"
git push origin main

# Ver el workflow en acción:
# https://github.com/arielsch74/bizuit-custom-form-sample/actions
```

---

## Troubleshooting

### Error: "Dependencies lock file is not found"
✅ **YA RESUELTO** - El package-lock.json ya fue pusheado exitosamente.

### Error: "BIZUIT_API_TOKEN is not set"
Configurar el secret en: https://github.com/arielsch74/bizuit-custom-form-sample/settings/secrets/actions

### Error: "refusing to allow an OAuth App to create workflow"
Es normal - por eso estamos agregando el workflow manualmente desde la web.

### Workflow no se ejecuta cuando hago push
Verificar que:
1. El archivo esté en `.github/workflows/compile-and-publish.yml`
2. Los cambios afecten la carpeta `forms/`
3. El workflow esté habilitado en la pestaña Actions

---

## Archivo de Referencia

El workflow también está disponible en tu proyecto principal:
- **Path:** `/Users/arielschwindt/SourceCode/PlayGround/BizuitFormTemplate/github-actions-workflow-example.yml`
- **Path local clonado:** `/tmp/bizuit-custom-form-sample/.github/workflows/compile-and-publish.yml`

---

## Próximos Pasos

Una vez que el workflow esté configurado:

1. ✅ Configurar secrets (BIZUIT_API_URL, BIZUIT_API_TOKEN)
2. ✅ Hacer un push de prueba a `forms/`
3. ✅ Verificar que el workflow compile y publique exitosamente
4. ✅ Verificar que los forms aparezcan en la base de datos
5. ✅ Verificar hot reload en la aplicación Bizuit

---

**Última actualización:** 2025-11-11
**Repositorio:** https://github.com/arielsch74/bizuit-custom-form-sample
