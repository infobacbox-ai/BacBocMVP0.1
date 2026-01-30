---
description: React 19 type compatibility strategy and patterns
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: false
---

# React 19 Type Compatibility

> Standardized approach for handling React 19's stricter type checking with third-party libraries.

## Context

React 19 introduced stricter type checking for JSX elements and component props. Many third-party libraries have not yet updated their types, causing TypeScript errors even though the code runs correctly.

## The Problem

```tsx
// This works at runtime but fails TypeScript in React 19
<Script src="..." strategy="afterInteractive" />
// Error: Type '{ src: string; strategy: string }' is not assignable to type 'IntrinsicAttributes'

<Dropzone onDrop={handleDrop}>
  {/* ... */}
</Dropzone>
// Error: Property 'children' does not exist on type 'DropzoneProps'
```

## Solution Hierarchy

Use these approaches in order of preference:

### 1. Explicit Type Assertions (Preferred)

When possible, use explicit type casts that make the intent clear:

```tsx
// ✅ Best: Explicit cast with explanation
import type { ComponentProps } from 'react';
import Script from 'next/script';

<Script
  {...({
    src: "https://example.com/script.js",
    strategy: "afterInteractive"
  } as ComponentProps<typeof Script>)}
/>
```

**Why this is best:**
- Self-documenting
- Type-safe (catches invalid props)
- Easy to remove when library updates

### 2. @ts-expect-error with Context (Common)

For components where type assertions are cumbersome:

```tsx
// ✅ Good: Suppression with clear context
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." strategy="afterInteractive" />

{/* @ts-expect-error - React 19 type incompatibility: Dropzone v14 missing children in types */}
<Dropzone onDrop={handleDrop}>
  <p>Drop files here</p>
</Dropzone>
```

**Format requirements:**
- Use `@ts-expect-error` (NOT `@ts-ignore`)
- Include library name and version if relevant
- One line, concise explanation
- Place directly above the problematic line

### 3. Track Technical Debt (Always)

Add TODO comments for tracking when suppressions can be removed:

```tsx
{/* TODO(react-19): Remove when next/script updates types for React 19 */}
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." strategy="afterInteractive" />

{/* TODO(react-19): Remove when react-dropzone v15+ is stable */}
{/* Tracking: https://github.com/react-dropzone/react-dropzone/issues/1234 */}
{/* @ts-expect-error - React 19 type incompatibility: Dropzone v14 missing children in types */}
<Dropzone onDrop={handleDrop}>
  <p>Drop files here</p>
</Dropzone>
```

## Common Scenarios

### Next.js Script Component

```tsx
import Script from 'next/script';
import type { ComponentProps } from 'react';

// Option 1: Type assertion
<Script
  {...({
    src: "https://analytics.example.com/script.js",
    strategy: "afterInteractive",
    onLoad: () => console.log('loaded')
  } as ComponentProps<typeof Script>)}
/>

// Option 2: Suppression (if many Script tags)
{/* TODO(react-19): Remove when next 15.1+ updates Script types */}
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." strategy="afterInteractive" />
```

### Third-Party UI Components

```tsx
import { Dropzone } from 'react-dropzone';
import { QRCodeSVG } from 'qrcode.react';
import { ThemeProvider } from 'next-themes';

// Dropzone (missing children prop)
{/* @ts-expect-error - React 19 type incompatibility: Dropzone v14 missing children in types */}
<Dropzone onDrop={handleDrop}>
  <p>Drop files here</p>
</Dropzone>

// QRCode (incorrect prop types)
{/* @ts-expect-error - React 19 type incompatibility: qrcode.react v4 incorrect prop types */}
<QRCodeSVG value={totpUri} size={200} level="M" />

// ThemeProvider (missing children prop)
{/* @ts-expect-error - React 19 type incompatibility: next-themes v0.4 missing children in types */}
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Chart Libraries (Recharts, Chart.js wrappers)

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

{/* @ts-expect-error - React 19 type incompatibility: Recharts v2 incorrect component types */}
<LineChart width={500} height={300} data={data}>
  {/* @ts-expect-error - React 19 type incompatibility: Recharts XAxis types */}
  <XAxis dataKey="name" />
  {/* @ts-expect-error - React 19 type incompatibility: Recharts YAxis types */}
  <YAxis />
  {/* @ts-expect-error - React 19 type incompatibility: Recharts Line types */}
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

### Form Libraries

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// zodResolver type compatibility
const form = useForm({
  // Explicit type annotation to help inference
  resolver: zodResolver(schema) as any, // TODO(react-19): Remove cast when @hookform/resolvers updates
  defaultValues: { name: "" }
});
```

## Anti-Patterns

### ❌ Never Use @ts-ignore

```tsx
// ❌ WRONG: Too broad, hides all errors
// @ts-ignore
<Script src="..." strategy="afterInteractive" />

// ✅ CORRECT: Specific, documents why
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." strategy="afterInteractive" />
```

**Why?**
- `@ts-ignore` hides **all** errors on the next line, including real bugs
- `@ts-expect-error` only suppresses if there's actually an error (fails if error is fixed)

### ❌ Don't Use Overly Broad Type Assertions

```tsx
// ❌ WRONG: Loses all type safety
<Script {...({ src: "..." } as any)} />

// ✅ CORRECT: Preserves prop validation
<Script {...({ src: "..." } as ComponentProps<typeof Script>)} />
```

### ❌ Don't Suppress Without Context

```tsx
// ❌ WRONG: Future you won't know why
{/* @ts-expect-error */}
<Script src="..." />

// ✅ CORRECT: Clear reason
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." />
```

## When to Remove Suppressions

Remove `@ts-expect-error` directives when:

1. **Library updates** - After upgrading a library, try removing suppressions
2. **TypeScript error appears** - If you see "Unused '@ts-expect-error' directive", the library has fixed types
3. **React upgrade** - After upgrading React, test removing suppressions

### Testing for Removals

```bash
# Run type-check to see if suppressions are still needed
pnpm -w type-check

# If you see:
# "Unused '@ts-expect-error' directive"
# → The suppression can be removed!
```

## CI Integration

The `validate-branches.yml` and `validate-prs.yml` workflows will:
- ✅ **Accept** valid `@ts-expect-error` directives (type error exists)
- ❌ **Fail** on unused `@ts-expect-error` directives (error was fixed)
- ❌ **Fail** on `@ts-ignore` usage (too broad)

## Migration Guide

If you find code using old patterns, migrate:

```tsx
// Old pattern (deprecated)
// @ts-ignore
<ThemeProvider>{children}</ThemeProvider>

// New pattern
{/* TODO(react-19): Remove when next-themes v0.5+ is stable */}
{/* @ts-expect-error - React 19 type incompatibility: next-themes v0.4 missing children in types */}
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

## Related Issues

Track React 19 compatibility issues:
- Next.js Script: [vercel/next.js#...](https://github.com/vercel/next.js/issues)
- React Dropzone: [react-dropzone/react-dropzone#...](https://github.com/react-dropzone/react-dropzone/issues)
- Recharts: [recharts/recharts#...](https://github.com/recharts/recharts/issues)

## Summary

**Quick Reference:**

| Pattern | When to Use | Example |
|---------|-------------|---------|
| Type assertion | Single-use, clear props | `{...(props as ComponentProps<typeof X>)}` |
| `@ts-expect-error` | Multiple uses, complex props | `{/* @ts-expect-error - reason */}` |
| `@ts-ignore` | **NEVER** | ❌ Don't use |

**Always include:**
1. Clear comment explaining the incompatibility
2. Library name and version if relevant
3. TODO comment with tracking issue when possible
