# Check React 19 Compatibility

Scan the codebase for React 19 type incompatibilities and suggest fixes based on established patterns.

## Task

Identify files with React 19 type compatibility issues and provide actionable fix suggestions.

## Scan Strategy

### 1. Run Type-Check First

```bash
pnpm -w type-check 2>&1 | tee type-check-output.txt
```

Parse the output for React 19-related errors:
- Type incompatibilities with component props
- Missing children props in types
- JSX element type mismatches
- Third-party library type errors

### 2. Identify Problem Files

Look for these error patterns:

**Pattern 1: Missing children prop**
```
Type '{ children: ReactNode }' is not assignable to type 'ThemeProviderProps'
Property 'children' does not exist on type 'ThemeProviderProps'
```

**Pattern 2: Component prop type mismatches**
```
Type '{ src: string; strategy: string }' is not assignable to type 'IntrinsicAttributes'
```

**Pattern 3: JSX element incompatibility**
```
JSX element type 'ReactElement' is not a constructor function for JSX elements
```

### 3. Categorize by Library

Group errors by affected library:
- Next.js components (`next/script`, `next/image`)
- UI libraries (`react-dropzone`, `qrcode.react`, `next-themes`)
- Chart libraries (`recharts`, `react-chartjs-2`)
- Form libraries (`@hookform/resolvers/zod`)

## Output Format

Present findings in a structured report:

```markdown
# React 19 Compatibility Scan Results

## Summary

- ✅ Files scanned: 413
- ⚠️ Files with issues: 8
- 📦 Affected libraries: 5

## Issues by Library

### next/script (3 files)

**apps/web/modules/analytics/provider/pirsch/index.tsx**
- Line 10: Type incompatibility with Script component props
- Fix: Apply type assertion pattern

**apps/web/modules/analytics/provider/plausible/index.tsx**
- Line 15: Type incompatibility with Script component props
- Fix: Apply type assertion pattern

**apps/web/modules/analytics/provider/umami/index.tsx**
- Line 12: Type incompatibility with Script component props
- Fix: Apply type assertion pattern

### react-dropzone (2 files)

**apps/web/modules/saas/organizations/components/OrganizationLogoForm.tsx**
- Line 45: Missing children prop in Dropzone types
- Fix: Add @ts-expect-error suppression

**apps/web/modules/saas/settings/components/UserAvatarUpload.tsx**
- Line 32: Missing children prop in Dropzone types
- Fix: Add @ts-expect-error suppression

[Continue for each library...]
```

## Fix Suggestions

For each issue, provide a specific fix based on `.cursor/rules/react-19-compat.md`:

### For Next.js Script Component

```tsx
// Current (broken)
<Script src="..." strategy="afterInteractive" />

// Fix Option 1: Type assertion (preferred for single use)
import type { ComponentProps } from 'react';
import Script from 'next/script';

<Script
  {...({
    src: "https://example.com/script.js",
    strategy: "afterInteractive"
  } as ComponentProps<typeof Script>)}
/>

// Fix Option 2: Suppression (preferred for multiple uses)
{/* TODO(react-19): Remove when next/script updates types */}
{/* @ts-expect-error - React 19 type incompatibility with next/script */}
<Script src="..." strategy="afterInteractive" />
```

### For Missing Children Props

```tsx
// Current (broken)
<Dropzone onDrop={handleDrop}>
  <p>Drop files here</p>
</Dropzone>

// Fix: Add suppression
{/* TODO(react-19): Remove when react-dropzone v15+ is stable */}
{/* @ts-expect-error - React 19 type incompatibility: Dropzone v14 missing children in types */}
<Dropzone onDrop={handleDrop}>
  <p>Drop files here</p>
</Dropzone>
```

## Detailed Analysis Mode

If requested, provide deeper analysis:

### 1. Root Cause

```
Library: react-dropzone@14.x
Issue: Type definitions missing `children` prop
Upstream: https://github.com/react-dropzone/react-dropzone/issues/1234
Status: Fixed in v15 (unreleased)
```

### 2. Impact Assessment

```
Severity: LOW
- Code works correctly at runtime
- Only affects TypeScript checking
- No functional impact

Risk: LOW
- Suppression is localized
- Easy to remove when library updates
- Tracked with TODO comment
```

### 3. Alternatives

```
1. Type assertion (more verbose, type-safe)
2. @ts-expect-error suppression (recommended)
3. Downgrade React to 18.x (not recommended)
4. Wait for library update (blocks development)
```

## Bulk Fix Workflow

If multiple files have the same issue:

```
Found 8 files with next/script compatibility issues.

Apply bulk fix? (yes/no)

If yes:
1. Generate fix for each file
2. Show diff preview
3. Apply fixes
4. Run type-check to verify
5. Report results
```

## Verification

After suggesting fixes, offer to verify:

```bash
# Apply fixes (if approved)
# Then run type-check
pnpm -w type-check

# Report reduction in errors
Before: 23 type errors
After: 15 type errors
Fixed: 8 React 19 compatibility issues
Remaining: 15 other type errors
```

## Integration with Rules

Reference the established patterns:

```
📖 See .cursor/rules/react-19-compat.md for:
- Detailed fix patterns
- Anti-patterns to avoid
- Migration guide
- When to remove suppressions
```

## Quick Scan Mode

For fast checks, run a lightweight scan:

```bash
# Search for known problematic patterns
grep -r "@ts-expect-error.*React 19" apps/ packages/

# Count suppressions
echo "Current React 19 suppressions: [count]"

# Check for @ts-ignore (should be zero)
grep -r "@ts-ignore" apps/ packages/ --include="*.tsx" --include="*.ts"
```

Report:
```
Quick Scan Results:
- React 19 suppressions: 12
- @ts-ignore usage: 0 ✅
- Unused suppressions: 0 ✅
```

## Output Options

1. **Summary only**: High-level counts and affected libraries
2. **Detailed report**: File-by-file breakdown with fixes
3. **Interactive mode**: Prompt to apply fixes one by one
4. **Bulk mode**: Apply all fixes automatically

## Notes

- This command complements `validate-local` by focusing specifically on React 19 issues
- Run after upgrading React or third-party libraries
- Useful for tracking technical debt removal progress
- Can be run as part of PR review process
