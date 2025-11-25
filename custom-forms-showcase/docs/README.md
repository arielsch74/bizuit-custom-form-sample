# 📚 Bizuit Forms Showcase - Documentation

Central index for all showcase-specific documentation.

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
- **[Runtime App Overview](../../custom-forms/docs/runtime-app/OVERVIEW.md)** - Runtime App architecture (custom-forms project)

### Guides & Testing
- [Hot Reload Demo](guides/HOT_RELOAD_DEMO.md) - Test dynamic form reloading

### Code Examples
- [Dynamic Form Simple](examples/01-dynamic-form-simple.tsx) - Basic dynamic form
- [Get Instance Data](examples/06-get-instance-data.tsx) - Fetch process instance data

### Technical Documentation
- **[Runtime Configuration](../../custom-forms/docs/setup/RUNTIME_CONFIG.md)** - Build-time vs runtime configuration (custom-forms project)
- **[Implementation Status](../../custom-forms/docs/architecture/CUSTOM_FORMS_IMPLEMENTATION_STATUS.md)** - CDN loading challenges and alternatives (custom-forms project)

---

**Last updated:** 2025-11-25
