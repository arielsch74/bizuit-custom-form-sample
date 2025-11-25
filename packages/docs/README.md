# 📦 Bizuit Packages - Documentation

Documentation for published npm packages: `@tyconsa/bizuit-form-sdk` and `@tyconsa/bizuit-ui-components`.

---

## 📖 Main Guides

| Document | Description |
|----------|-------------|
| **[Getting Started](GETTING_STARTED.md)** | Complete guide for developers using the published packages |
| **[Quick Reference](QUICK_REFERENCE.md)** | Quick code snippets and patterns |

---

## 📦 Published Packages

### [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)

Core SDK for Bizuit BPM integration.

**Latest Version:** 2.0.0

**Installation:**
```bash
npm install @tyconsa/bizuit-form-sdk
```

**Key Features:**
- Process initialization and RaiseEvent
- Authentication and authorization
- Instance locking (pessimistic locking)
- React hooks (useBizuitSDK, useAuth)
- Parameter parsing (JSON/XML)

**Documentation:**
- [Package README](../bizuit-form-sdk/README.md)
- [Getting Started Guide](GETTING_STARTED.md)
- [Quick Reference](QUICK_REFERENCE.md)

---

### [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components)

UI component library for Bizuit forms.

**Latest Version:** 1.7.0

**Installation:**
```bash
npm install @tyconsa/bizuit-ui-components
```

**Key Components:**
- BizuitDataGrid (TanStack Table v8)
- BizuitCombo (searchable select with multi-select)
- BizuitDateTimePicker
- BizuitSlider
- BizuitFileUpload
- DynamicFormField (auto-generated fields)
- ProcessSuccessScreen

**Documentation:**
- [Package README](../bizuit-ui-components/README.md)
- [Getting Started Guide](GETTING_STARTED.md)
- [Quick Reference](QUICK_REFERENCE.md)

---

## 🚀 Quick Start

```bash
# 1. Install packages
npm install @tyconsa/bizuit-form-sdk @tyconsa/bizuit-ui-components

# 2. Import styles (in your main CSS/app)
@import '@tyconsa/bizuit-ui-components/dist/styles.css';

# 3. Start building forms
# See GETTING_STARTED.md for complete guide
```

---

## 🗂️ Directory Structure

```
packages/
├── docs/                              # ← You are here
│   ├── README.md                      # This file
│   ├── GETTING_STARTED.md             # Complete getting started guide
│   └── QUICK_REFERENCE.md             # Quick code snippets
│
├── bizuit-form-sdk/                   # SDK package source
│   ├── README.md
│   ├── src/
│   └── package.json
│
└── bizuit-ui-components/              # UI Components package source
    ├── README.md
    ├── src/
    └── package.json
```

---

## 📚 Additional Resources

- **Custom Forms Project**: [../custom-forms/](../../custom-forms/) - Production application using these packages
- **Showcase App**: [../custom-forms-showcase/](../../custom-forms-showcase/) - Demo application with examples
- **Root README**: [../../README.md](../../README.md) - Monorepo overview

---

**Last updated:** 2025-11-25
