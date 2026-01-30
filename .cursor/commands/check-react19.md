# Check React 19 Compatibility

**Goal**: Find and report React 19 type incompatibilities with fix suggestions.

## Process

1. Run `pnpm -w type-check` and capture output
2. Extract React 19-related errors (children props, JSX types, component prop mismatches)
3. Group by library (next/script, react-dropzone, recharts, etc.)
4. Cross-reference fixes from `.cursor/rules/react-19-compat.md`

## Output Format

### Summary

- Files scanned: [count]
- Files with issues: [count]
- Affected libraries: [list]

### Issues by Library

For each library:
- File path + line
- Error description
- Recommended fix (suppression or type assertion)

### Quick Stats

- Current React 19 suppressions: `rg "@ts-expect-error.*React 19" apps/ packages/ -c`
- @ts-ignore usage (should be 0): `rg "@ts-ignore" apps/ packages/ -g "*.tsx" -c`

## After Reporting

Offer to apply fixes. If accepted:
1. Apply fix to each file
2. Re-run type-check
3. Report error reduction
