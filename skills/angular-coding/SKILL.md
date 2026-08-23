---
name: angular-coding
description: Angular best practices for developing scalable, maintainable web applications. Use this skill when writing or reviewing Angular code.
license: MIT
---

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

### Components

- **ALL new components MUST be standalone components**
- When working with existing components, convert to standalone if the refactor is minimal
- Must NOT set `standalone: true` inside Angular decorators - it's the default in Angular v20+
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- For Angular v22+, omit `changeDetection: ChangeDetectionStrategy.OnPush` because `OnPush` is the default; set it explicitly in earlier versions
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms in Angular v22+
- When Signal Forms are unavailable, prefer Reactive forms instead of Template-driven ones
- Implement lazy loading for feature routes
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT use the `@HostBinding` and `@HostListener` decorators - put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- When using external templates/styles, use paths relative to the component TS file

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Effects and Side Effects

- **WARNING**: `effect()` creates a reactive context that re-runs whenever any signal it reads changes
- **NEVER set signals inside an `effect()`** - this causes infinite loops because setting a signal triggers the effect to re-run
- Use `untracked()` to read signal values without establishing a dependency when you need to access signals without triggering re-runs
- Prefer `effect()` for new code over RxJS subscribe
- Only use RxJS subscriptions when working with existing code that already uses them and a refactor isn't warranted

### Services

- Design services around a single responsibility
- In Angular v22+, prefer `@Service` for new root singleton services
- In earlier versions, use `@Injectable({ providedIn: 'root' })` for singleton services
- Use the `inject()` function instead of constructor injection

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not write arrow functions in templates (they are not supported)
- Do not assume globals like (`new Date()`) are available in templates
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images)

## Accessibility

- Pass all AXE checks
- Meet WCAG AA requirements, including focus management, color contrast, and ARIA attributes

## Signal Utilities

- Prefer using `SignalUtils.getFeatureFlag()` for feature flags instead of async pipe or subscribe patterns
- Use `SignalUtils.getFeatureFlags()` when you need multiple feature flags
- Use `SignalUtils.getFeatureFlagData<T>()` when feature flags contain data
- Use `SignalUtils.isRegionEnabledForFeature()` for region-based feature checks
- Convert observables to signals using `toSignal()` from `@angular/core/rxjs-interop` when needed

## Testing

**IMPORTANT**: For detailed testing patterns, always refer to the `angular-testing` skill. This section provides only high-level guidelines.

### When Writing Tests

- Load the `angular-testing` skill for comprehensive testing patterns
- Use `ts-mockito` for mocking all dependencies
- Write **unit tests only** - do NOT write integration tests
- Do NOT test templates - test component logic only
- Use constructor injection for services and directives (no TestBed)
- Use TestBed only for component testing
- Use `fakeAsync()` and `tick()` for asynchronous code
- Use `deepEqual()` when comparing entire objects

### Test Isolation

- Use `fdescribe()` to focus on a specific describe block and skip all other tests
- Use `fit()` to focus on a specific test case and skip all others
- Remove the `f` prefix after testing and before committing
