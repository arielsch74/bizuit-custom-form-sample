# Bizuit Custom Forms - Sample Repository

This is a sample repository that demonstrates how to create, compile, and automatically publish custom forms for the Bizuit BPM system.

## Overview

This repository shows the recommended workflow for managing custom forms:

1. **Write forms** in TypeScript/JSX using React components
2. **Compile automatically** with esbuild via GitHub Actions
3. **Publish automatically** to your Bizuit API when you push changes
4. **Hot reload** in the Bizuit application without redeployment

## Repository Structure

```
bizuit-custom-form-sample/
├── .github/
│   └── workflows/
│       └── compile-and-publish.yml   # GitHub Actions workflow
├── forms/                             # Your custom forms (TypeScript/JSX)
│   ├── employee-leave-request.tsx
│   └── purchase-order-approval.tsx
├── scripts/
│   ├── compile-forms.js               # Compiles forms with esbuild
│   └── publish-forms.js               # Publishes to Bizuit API
├── dist/                              # Compiled output (gitignored)
├── package.json
└── README.md
```

## Getting Started

### 1. Clone or Fork This Repository

```bash
git clone https://github.com/your-username/bizuit-custom-form-sample.git
cd bizuit-custom-form-sample
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure GitHub Secrets

Go to your repository settings → Secrets and variables → Actions, and add:

- **`BIZUIT_API_URL`**: Your Bizuit API endpoint (e.g., `https://api.yourdomain.com`)
- **`BIZUIT_API_TOKEN`**: Your API authentication token

### 4. Create Your Forms

Add your custom forms in the `forms/` directory. Each form should:

- Export a default React component
- Use TypeScript/JSX syntax
- Import UI components from `@/components/ui/*`
- Follow the form interface pattern (see examples)

### 5. Test Locally

Compile forms locally:

```bash
npm run build
```

Watch for changes during development:

```bash
npm run build:watch
```

### 6. Push to GitHub

When you push changes to the `main` branch that affect files in `forms/`:

```bash
git add forms/
git commit -m "Add new purchase order form"
git push origin main
```

The GitHub Action will automatically:
1. Compile your forms with esbuild
2. Publish them to your Bizuit API
3. Make them available immediately via hot reload

## Example Form Structure

```tsx
import React, { useState } from 'react';
import { BizuitCard } from '@/components/ui/BizuitCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface MyFormData {
  field1: string;
  field2: string;
}

interface MyFormProps {
  initialData?: Partial<MyFormData>;
  onSubmit: (data: MyFormData) => void;
  onCancel?: () => void;
}

export default function MyCustomForm({
  initialData = {},
  onSubmit,
  onCancel,
}: MyFormProps) {
  const [formData, setFormData] = useState<MyFormData>({
    field1: initialData.field1 || '',
    field2: initialData.field2 || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BizuitCard title="My Custom Form">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={formData.field1}
          onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
        />
        <Button type="submit">Submit</Button>
      </form>
    </BizuitCard>
  );
}
```

## Available UI Components

The Bizuit BPM system provides these UI components:

- `BizuitCard` - Card container with title
- `Button` - Button with variants (default, outline, destructive)
- `Input` - Text input field
- `Textarea` - Multi-line text input
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - Dropdown select
- `Label` - Form field label

## Development Workflow

### Local Development

1. Create or edit forms in `forms/`
2. Run `npm run build:watch` to compile on save
3. Check `dist/` for compiled output
4. Test in your local Bizuit environment

### Publishing to Production

1. Commit your changes to `forms/`
2. Push to `main` branch
3. GitHub Actions automatically compiles and publishes
4. Forms are immediately available in production (hot reload)

### Manual Publishing

If you need to publish manually:

```bash
# Build forms
npm run build

# Publish to API (requires environment variables)
export BIZUIT_API_URL="https://api.yourdomain.com"
export BIZUIT_API_TOKEN="your-token"
npm run publish:forms
```

## Troubleshooting

### Forms not compiling

- Check that your forms are valid TypeScript/JSX
- Ensure all imports are correct
- Look at GitHub Actions logs for error messages

### Forms not appearing in Bizuit

- Verify your API credentials in GitHub Secrets
- Check that the API endpoint is accessible
- Ensure the form name matches what's expected in Bizuit

### Hot reload not working

- Check that you're polling the `/api/custom-forms/versions` endpoint
- Verify the form name is correct
- Make sure the compiled code was published successfully

## Support

For issues with:
- **This repository**: Open an issue in this repo
- **Bizuit BPM system**: Contact your Bizuit support team
- **Form compilation**: Check the esbuild documentation

## License

ISC
