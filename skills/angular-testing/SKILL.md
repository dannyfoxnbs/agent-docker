---
name: angular-testing
description: Angular testing best practices using ts-mockito and Jasmine. Use this skill when writing or reviewing Angular tests for components, services, and directives.
license: MIT
---

## Overview

This skill provides standardized patterns for Angular unit testing using:

- **ts-mockito** for mocking services and dependencies
- **Jasmine** as the testing framework
- **fakeAsync/tick** for asynchronous testing
- **Pure unit tests only** - no integration tests

## Testing Philosophy

- Write **unit tests only** - do NOT write integration tests
- Do NOT test templates - test component logic only
- Mock all dependencies completely using ts-mockito
- Use constructor injection approach for services and directives
- Use TestBed for component testing with standalone components
- Always use `deepEqual` when comparing entire objects to avoid test fragility

## Required Imports

```typescript
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { mock, instance, when, anything, deepEqual } from "ts-mockito";
import { of } from "rxjs";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
```

## Component Testing Pattern

### Complete Component Test Example

```typescript
describe("ProductDetailsHeaderComponent", () => {
  let component: ProductDetailsHeaderComponent;
  let fixture: ComponentFixture<ProductDetailsHeaderComponent>;
  let mockArchivedProductsService: ArchivedProductService;
  let mockClauseManufacturerContext: ClauseManufacturerContext;
  let mockFeatureFlags: FeatureFlags;

  const mockProduct = {
    id: "1",
  } as Product;

  beforeEach(() => {
    // 1. Create mocks using ts-mockito mock()
    mockArchivedProductsService = mock(ArchivedProductService);
    mockFeatureFlags = mock<FeatureFlags>();
    mockClauseManufacturerContext = mock(ClauseManufacturerContext);

    // 2. Set up mock return values using when().thenReturn/thenResolve()
    when(
      mockFeatureFlags.featureEnabled(
        CurrentBooleanFeatureFlags.ArchivedProductsPanel,
        false,
      ),
    ).thenResolve(true);
    when(
      mockArchivedProductsService.getArchivedProductInfo(mockProduct),
    ).thenReturn(
      of({
        isRemoved: false,
        originalProduct: mockProduct,
        latestProduct: mockProduct,
      }),
    );

    // 3. Configure TestBed for standalone component
    TestBed.configureTestingModule({
      imports: [
        ProductDetailsHeaderComponent, // Standalone component goes in imports, NOT declarations
      ],
      providers: [
        {
          provide: ArchivedProductService,
          useValue: instance(mockArchivedProductsService),
        },
        { provide: FEATURE_FLAGS, useValue: instance(mockFeatureFlags) },
        {
          provide: ClauseManufacturerContext,
          useValue: instance(mockClauseManufacturerContext),
        },
        { provide: BrandConfigService, useValue: { brand: MOCK_BRAND_CONFIG } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    // 4. Create component fixture
    fixture = TestBed.createComponent(ProductDetailsHeaderComponent);

    // 5. Set component inputs using fixture.componentRef.setInput()
    fixture.componentRef.setInput("product", mockProduct);
    fixture.componentRef.setInput("canAddProducts", true);

    // 6. Get component instance
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

### Key Component Testing Rules

1. **Standalone Components**: Import in `imports` array, NOT `declarations`
2. **Input Setting**: Always use `fixture.componentRef.setInput('inputName', value)`
3. **Mock Setup**: Configure all mocks BEFORE calling `TestBed.configureTestingModule()`
4. **Instance**: Use `instance(mockObject)` to get the mock instance for providers
5. **Detect Changes**: Call `fixture.detectChanges()` after setting inputs

## Mocking Patterns

### Basic Service Mock

```typescript
// Create mock
let mockService: MyService;
mockService = mock(MyService);

// Set return value for method
when(mockService.getData()).thenReturn(of(mockData));
when(mockService.getById("123")).thenReturn(of(mockItem));

// Use in TestBed
providers: [{ provide: MyService, useValue: instance(mockService) }];
```

### Mocking with Arguments

```typescript
// Mock with specific argument
when(mockService.getById("123")).thenReturn(of(mockItem));

// Mock with any() matcher for flexible matching
when(mockService.getById(anything())).thenReturn(of(mockItem));

// Mock with deepEqual() for object comparison
when(mockService.save(deepEqual(expectedObject))).thenReturn(
  of({ success: true }),
);
```

### Mocking Feature Flags

```typescript
let mockFeatureFlags: FeatureFlags;
mockFeatureFlags = mock<FeatureFlags>();

// Boolean feature flags
when(
  mockFeatureFlags.featureEnabled(
    CurrentBooleanFeatureFlags.SomeFeature,
    false,
  ),
).thenResolve(true);

// Data feature flags
when(
  mockFeatureFlags.featureData(CurrentDataFeatureFlags.SomeDataFeature),
).thenResolve(mockData);
```

### Mocking Observables

```typescript
import { of, throwError } from "rxjs";

// Success case
when(mockService.getData()).thenReturn(of(mockData));

// Error case
when(mockService.getData()).thenReturn(throwError(() => new Error("Failed")));

// Empty response
when(mockService.getData()).thenReturn(of(null));
```

## Async Testing with fakeAsync

### Basic Async Pattern

```typescript
it("should load data on init", fakeAsync(() => {
  // Arrange
  when(mockService.getData()).thenReturn(of(mockData));

  // Act
  fixture.detectChanges(); // Triggers ngOnInit
  tick(); // Flushes pending async operations

  // Assert
  expect(component.data()).toEqual(mockData);
}));
```

### Multiple Async Operations

```typescript
it("should handle chained async operations", fakeAsync(() => {
  when(mockService.firstCall()).thenReturn(of(firstResult));
  when(mockService.secondCall(firstResult)).thenReturn(of(finalResult));

  component.loadData();
  tick();

  expect(component.result()).toEqual(finalResult);
}));
```

### Testing Signal-Based Async Code

```typescript
it("should update signal after async operation", fakeAsync(() => {
  const mockData = { items: [] };
  when(mockService.fetchItems()).thenReturn(of(mockData));

  fixture.detectChanges();
  tick();

  expect(component.items()).toEqual(mockData.items);
}));
```

## Service Testing Pattern

For services, use the **constructor approach** rather than TestBed:

```typescript
describe("ProductService", () => {
  let service: ProductService;
  let mockHttp: HttpClient;
  let mockLogger: LoggerService;

  beforeEach(() => {
    mockHttp = mock(HttpClient);
    mockLogger = mock(LoggerService);

    // Create service instance directly with mocked dependencies
    service = new ProductService(instance(mockHttp), instance(mockLogger));
  });

  it("should fetch products", fakeAsync(() => {
    const mockProducts = [{ id: "1", name: "Product 1" }];
    when(mockHttp.get("/api/products")).thenReturn(of(mockProducts));

    let result: any;
    service.getProducts().subscribe((data) => {
      result = data;
    });
    tick();

    expect(result).toEqual(mockProducts);
  }));
});
```

## Directive Testing Pattern

For directives, also use the **constructor approach**:

```typescript
describe("HighlightDirective", () => {
  let directive: HighlightDirective;
  let mockElementRef: ElementRef;
  let mockRenderer: Renderer2;

  beforeEach(() => {
    mockElementRef = mock(ElementRef);
    mockRenderer = mock(Renderer2);

    directive = new HighlightDirective(
      instance(mockElementRef),
      instance(mockRenderer),
    );
  });

  it("should highlight element", () => {
    directive.highlightColor = "red";
    directive.onMouseEnter();

    // Verify renderer was called
    // Note: ts-mockito doesn't verify method calls directly,
    // but you can test the behavior through component state
  });
});
```

## Assertion Patterns

### Testing Signals

```typescript
it("should update computed signal", () => {
  fixture.componentRef.setInput("items", [1, 2, 3]);

  expect(component.totalCount()).toBe(3);
});

it("should handle null inputs", () => {
  fixture.componentRef.setInput("product", null);

  expect(component.isValid()).toBe(false);
});
```

### Testing Event Emitters

```typescript
it("should emit event on button click", () => {
  const spy = spyOn(component.buttonClicked, "emit");

  component.onButtonClick();

  expect(spy).toHaveBeenCalled();
});

it("should emit with specific value", () => {
  const spy = spyOn(component.itemSelected, "emit");

  component.selectItem(mockItem);

  expect(spy).toHaveBeenCalledWith(mockItem);
});

it("should not emit when condition is false", () => {
  const spy = spyOn(component.action, "emit");
  component.canPerformAction = false;

  component.performAction();

  expect(spy).not.toHaveBeenCalled();
});
```

### Testing Method Calls

```typescript
it("should call service method", fakeAsync(() => {
  when(mockService.save(deepEqual(mockData))).thenReturn(of({ success: true }));

  component.save();
  tick();

  // Test was successful if no error thrown
}));

it("should handle errors", fakeAsync(() => {
  when(mockService.save(anything())).thenReturn(
    throwError(() => new Error("Failed")),
  );

  component.save();
  tick();

  expect(component.error()).toBe("Failed");
}));
```

## Object Comparison Best Practices

### Always Use deepEqual for Object Comparisons

```typescript
// GOOD: Use deepEqual for comparing entire objects
expect(component.config()).toEqual(PRODUCT_BUTTON_CONFIG.UPDATE_PRODUCT);

// GOOD: Use deepEqual in mock setup
when(mockService.process(deepEqual(expectedPayload))).thenReturn(of(result));

// GOOD: Compare specific properties when only certain fields matter
expect(component.product()?.id).toBe("123");

// AVOID: Direct object comparison without deepEqual
// This can fail due to reference differences
expect(component.product()).toBe(mockProduct); // DON'T DO THIS
```

## Test Isolation Helpers

### Focus on Specific Tests

```typescript
// Use fdescribe to run only this describe block
fdescribe("critical functionality", () => {
  // Only these tests will run
});

// Use fit to run only this specific test
fit("should handle critical edge case", () => {
  // Only this test will run
});
```

**Important**: Remove the `f` prefix before committing!

## Complete Test File Structure

```typescript
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { mock, instance, when, anything, deepEqual } from "ts-mockito";
import { of } from "rxjs";

// Component/Service under test
import { MyComponent } from "./my.component";

// Dependencies to mock
import { MyService } from "./my.service";
import { FeatureFlags, FEATURE_FLAGS } from "./feature-flags";

describe("MyComponent", () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockService: MyService;
  let mockFeatureFlags: FeatureFlags;

  const mockData = { id: "1", name: "Test" };

  beforeEach(() => {
    // 1. Create mocks
    mockService = mock(MyService);
    mockFeatureFlags = mock<FeatureFlags>();

    // 2. Configure mock behavior
    when(mockService.getData()).thenReturn(of(mockData));
    when(mockFeatureFlags.isEnabled("feature")).thenResolve(true);

    // 3. Configure TestBed
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: MyService, useValue: instance(mockService) },
        { provide: FEATURE_FLAGS, useValue: instance(mockFeatureFlags) },
      ],
    });

    // 4. Create fixture and component
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("feature functionality", () => {
    beforeEach(() => {
      // Additional setup for this describe block
      fixture.componentRef.setInput("data", mockData);
    });

    it("should process data correctly", fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.processedData()).toEqual(mockData);
    }));
  });
});
```

## Common Mistakes to Avoid

1. **DON'T** put standalone components in `declarations` - use `imports`
2. **DON'T** assign inputs directly - use `fixture.componentRef.setInput()`
3. **DON'T** forget to call `tick()` in `fakeAsync` tests
4. **DON'T** use `instance()` when creating mocks - use `mock()` then `instance()` for providers
5. **DON'T** test the template - test component logic only
6. **DON'T** forget to use `deepEqual` when comparing objects
7. **DON'T** use TestBed for service/directive testing - use constructor injection
8. **DON'T** write integration tests - keep tests isolated and pure unit tests

## Testing Checklist

Before submitting tests, verify:

- [ ] All dependencies are mocked using ts-mockito
- [ ] Standalone components are in `imports`, not `declarations`
- [ ] Inputs are set using `fixture.componentRef.setInput()`
- [ ] Async tests use `fakeAsync` and `tick()`
- [ ] Object comparisons use `deepEqual` where appropriate
- [ ] Services use constructor injection, not TestBed
- [ ] No template testing (no `querySelector`, `nativeElement` checks)
- [ ] All `f` prefixes removed from focused tests
