# 📚 Bizuit Forms Showcase - Documentation

Central index for all showcase-specific documentation.

---

---

## 🏗️ Architecture

| Document | Description | Location |
|----------|-------------|----------|
| **[Custom Forms Implementation Status](architecture/CUSTOM_FORMS_IMPLEMENTATION_STATUS.md)** | Analysis of dynamic form loading challenges and solutions | `docs/architecture/` |

---

## ⚙️ Setup & Configuration

| Document | Description | Location |
|----------|-------------|----------|
| **[Runtime Configuration Guide](setup/RUNTIME_CONFIG.md)** | Build-time vs runtime configuration explained | `docs/setup/` |

---

## 📋 Guides & Testing

| Document | Description | Location |
|----------|-------------|----------|
| **[Hot Reload Demo](guides/HOT_RELOAD_DEMO.md)** | Testing guide for form hot reload mechanism | `docs/guides/` |

---

## 💻 Code Examples

| Example | Description | Location |
|---------|-------------|----------|
| **[Dynamic Form Simple](examples/01-dynamic-form-simple.tsx)** | Basic dynamic form example | `docs/examples/` |
| **[Get Instance Data](examples/06-get-instance-data.tsx)** | Fetch process instance data | `docs/examples/` |

---

## 🗂️ Directory Structure

```
custom-forms-showcase/
├── README.md                          # Main project README
│
├── docs/                              # Documentation
│   ├── README.md                      # ← This file
│   │
│   ├── architecture/                  # Architecture and design
│   │   └── CUSTOM_FORMS_IMPLEMENTATION_STATUS.md
│   │
│   ├── setup/                         # Setup and configuration
│   │   └── RUNTIME_CONFIG.md
│   │
│   ├── guides/                        # Guides and testing
│   │   └── HOT_RELOAD_DEMO.md
│   │
│   └── examples/                      # Code examples
│       ├── 01-dynamic-form-simple.tsx
│       └── 06-get-instance-data.tsx
│
├── app/                               # Next.js app
├── components/                        # React components
└── lib/                               # Utilities
```

---

## 🔍 Quick Navigation

### Getting Started
- [Main README](../README.md) - Project overview and quick start
- **[Packages Documentation](../../packages/docs/)** - SDK and UI Components guides (GETTING_STARTED, QUICK_REFERENCE)
- **[Runtime App Overview](../../custom-forms/runtime-app/OVERVIEW.md)** - Runtime App architecture (custom-forms project)

### Development
- [Runtime Configuration](setup/RUNTIME_CONFIG.md) - Configure the app for dev/prod
- [Hot Reload Demo](guides/HOT_RELOAD_DEMO.md) - Test dynamic form reloading

### Code Examples
- [Dynamic Form Simple](examples/01-dynamic-form-simple.tsx) - Basic dynamic form
- [Get Instance Data](examples/06-get-instance-data.tsx) - Fetch process instance data

### Technical Analysis
- [Implementation Status](architecture/CUSTOM_FORMS_IMPLEMENTATION_STATUS.md) - CDN loading challenges and alternatives

---

**Last updated:** 2025-11-25
