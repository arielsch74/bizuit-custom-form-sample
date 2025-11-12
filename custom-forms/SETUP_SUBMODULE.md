# Setup Git Submodule para Forms

Instrucciones para configurar el repositorio de forms como Git submodule.

## 🎯 Objetivo

Separar los custom forms en un repositorio independiente para:
- ✅ CI/CD independiente
- ✅ Versionado separado
- ✅ Developers pueden trabajar solo en forms
- ✅ GitHub Actions en el repo correcto

## 📋 Paso 1: Crear Repositorio en GitHub

1. Ve a: https://github.com/arielsch74
2. Click "New repository"
3. Configuración:
   ```
   Repository name: bizuit-custom-form-sample
   Description: Sample custom forms for Bizuit BPM
   Visibility: Private (o Public según prefieras)
   Initialize: NO marcar "Add README"
   ```
4. Click "Create repository"

## 📦 Paso 2: Preparar Contenido para el Nuevo Repo

El contenido actual en `/custom-forms/forms-examples/` debe moverse al nuevo repo:

```bash
cd /Users/arielschwindt/SourceCode/PlayGround

# Crear directorio temporal
mkdir bizuit-custom-form-sample-temp
cd bizuit-custom-form-sample-temp

# Copiar contenido
cp -r ../BIZUITFormTemplate/custom-forms/forms-examples/* .

# Ver contenido
ls -la
# Debe mostrar:
#   .github/
#   aprobacion-gastos/
#   build-form.js
#   package.json
#   package-lock.json
```

## 🚀 Paso 3: Push al Nuevo Repo

```bash
cd /Users/arielschwindt/SourceCode/PlayGround/bizuit-custom-form-sample-temp

# Inicializar repo
git init
git add .
git commit -m "Initial commit: Custom forms samples"

# Conectar con GitHub (usa la URL que te dio GitHub)
git remote add origin https://github.com/arielsch74/bizuit-custom-form-sample.git

# Push
git branch -M main
git push -u origin main
```

## 🔗 Paso 4: Agregar como Submodule en BIZUITFormTemplate

```bash
cd /Users/arielschwindt/SourceCode/PlayGround/BIZUITFormTemplate/custom-forms

# IMPORTANTE: Primero hacer backup del directorio actual
mv forms-examples forms-examples-backup

# Agregar submodule
git submodule add https://github.com/arielsch74/bizuit-custom-form-sample.git forms-examples

# Commit el submodule
cd ..
git add .gitmodules custom-forms/forms-examples
git commit -m "Add forms-examples as Git submodule"
git push

# Verificar
git submodule status
# Debe mostrar el commit hash y el path
```

## ✅ Paso 5: Verificación

```bash
cd /Users/arielschwindt/SourceCode/PlayGround/BIZUITFormTemplate/custom-forms/forms-examples

# Verificar que es un submodule
git remote -v
# Debe mostrar: origin  https://github.com/arielsch74/bizuit-custom-form-sample.git

# Verificar contenido
ls -la
# Debe mostrar:
#   .github/workflows/build-deployment-package.yml
#   aprobacion-gastos/
#   build-form.js
#   package.json
```

## 🔄 Paso 6: Workflow para Developers

### Clonar proyecto principal CON submodules

```bash
# Opción 1: Clone recursivo (recomendado)
git clone --recursive https://github.com/tu-org/BIZUITFormTemplate.git

# Opción 2: Clone normal + init submodules
git clone https://github.com/tu-org/BIZUITFormTemplate.git
cd BIZUITFormTemplate
git submodule init
git submodule update
```

### Trabajar en forms

```bash
cd custom-forms/forms-examples

# Crear nuevo form
mkdir mi-nuevo-form
cd mi-nuevo-form
# ... desarrollar ...

# Commit en el repo de forms
git add .
git commit -m "feat: add mi-nuevo-form"
git push origin main

# Volver al repo principal y actualizar referencia
cd ../../..
git add custom-forms/forms-examples
git commit -m "Update forms-examples submodule"
git push
```

### Actualizar submodule a última versión

```bash
cd custom-forms/forms-examples

# Pull latest changes
git pull origin main

# Volver al repo principal
cd ../..

# Commit la nueva referencia del submodule
git add custom-forms/forms-examples
git commit -m "Update forms-examples to latest"
git push
```

## 🎬 Paso 7: GitHub Actions en el Repo Correcto

El GitHub Action ya está en el lugar correcto (`.github/workflows/`), solo necesita que el repo exista.

Una vez que el repo `bizuit-custom-form-sample` esté creado y pusheado:

1. Push activará automáticamente el workflow
2. Se generará el deployment package
3. Estará disponible en Artifacts

## 🧹 Paso 8: Cleanup (Opcional)

Una vez que el submodule esté configurado y funcionando:

```bash
cd /Users/arielschwindt/SourceCode/PlayGround/BIZUITFormTemplate/custom-forms

# Eliminar backup
rm -rf forms-examples-backup

cd /Users/arielschwindt/SourceCode/PlayGround

# Eliminar temp
rm -rf bizuit-custom-form-sample-temp
```

## 📝 Estructura Final

```
BIZUITFormTemplate/                     # Repo principal
├── .gitmodules                         # ✅ Config de submodules
├── custom-forms/
│   ├── runtime-app/
│   ├── backend-api/
│   ├── database/
│   ├── docs/
│   └── forms-examples/                 # ✅ Git submodule
│       ├── .git/                       # ⟶ apunta a bizuit-custom-form-sample
│       ├── .github/workflows/
│       ├── aprobacion-gastos/
│       ├── build-form.js
│       └── package.json

bizuit-custom-form-sample/              # Repo separado
├── .github/workflows/
│   └── build-deployment-package.yml    # ✅ GitHub Action
├── aprobacion-gastos/
├── solicitud-vacaciones/
├── onboarding-empleado/
├── build-form.js
├── package.json
└── README.md
```

## 🔍 Verificación Final

```bash
# En el repo principal
cd /Users/arielschwindt/SourceCode/PlayGround/BIZUITFormTemplate

# Ver submodules
git submodule status

# Debe mostrar algo como:
# 1a2b3c4d custom-forms/forms-examples (heads/main)

# Verificar .gitmodules
cat .gitmodules
# Debe contener:
# [submodule "custom-forms/forms-examples"]
#   path = custom-forms/forms-examples
#   url = https://github.com/arielsch74/bizuit-custom-form-sample.git
```

## ⚠️ Notas Importantes

1. **NO edites** forms directamente en el repo principal
2. **Siempre** trabaja en el submodule (cd forms-examples)
3. **Recuerda** commitear en AMBOS repos:
   - Primero en `forms-examples` (el submodule)
   - Luego en repo principal (la referencia del submodule)

## 🆘 Troubleshooting

### Submodule vacío después de clone

```bash
git submodule update --init --recursive
```

### Cambios en submodule no se ven

```bash
cd custom-forms/forms-examples
git pull origin main
cd ../..
git add custom-forms/forms-examples
git commit -m "Update submodule reference"
```

### Eliminar submodule

```bash
git submodule deinit -f custom-forms/forms-examples
rm -rf .git/modules/custom-forms/forms-examples
git rm -f custom-forms/forms-examples
```

## ✅ Resumen

Una vez completados estos pasos:
- ✅ Forms en repo separado con su propio CI/CD
- ✅ Runtime app referencia via submodule
- ✅ GitHub Actions genera deployment packages
- ✅ Developers pueden trabajar independientemente en forms o runtime
