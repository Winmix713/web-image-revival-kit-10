
# Error Documentation

This document outlines current errors in the codebase and their solutions.

## Current Errors

1. **TeamCard is not defined in Teams.tsx**
   - Error: `Uncaught ReferenceError: TeamCard is not defined`
   - Solution: Add missing import `import TeamCard from '../components/teams/TeamCard';` to Teams.tsx

2. **Duplicate identifier in PackageExport.tsx**
   - Error: `Duplicate identifier 'selectedComponents'`
   - Solution: Remove duplicate declaration of selectedComponents in the component props

3. **Grid layout issues**
   - Error: Text overflowing in grid components
   - Solution: Implement proper overflow handling with `truncate` class and adjust grid column widths

## Common Error Patterns

1. **Missing Imports**
   - Regularly check all component references have corresponding imports
   - Use absolute imports with `@/` prefix for internal components

2. **Type Duplication**
   - Avoid redeclaring types in function parameters that are already declared in interfaces
   - Use type merging or extension instead of duplication

3. **CSS Grid Issues**
   - Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern for responsive designs
   - Add `gap-4` or `gap-6` to prevent content overlap
   - Use `overflow-hidden` and `text-ellipsis` for text content that might overflow

4. **Mobile Responsiveness**
   - Many components lack proper mobile responsiveness
   - Use `sm:`, `md:`, and `lg:` breakpoint prefixes consistently
