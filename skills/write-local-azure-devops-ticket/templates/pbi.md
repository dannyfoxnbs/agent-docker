# Title

`<Feature>: <concise imperative summary>`
(Feature is the area the PBI relates to, before the colon — e.g. "Source add to schedule: Info icon and modal".)

## Description

(2–4 lines of prose: what we're building and why. Optionally a short bullet list of the pieces involved.)

## Acceptance Criteria

**Route in:** (how the user reaches this - the tab, action, or gesture that starts the flow.)

(Then grouped bullets under short category headings. Prefer bullets over long text. Break the work into small categories. Reference `data-cy` attributes for anything UI. Call out accessibility — tab order, keyboard actions, aria labels/descriptions.)

**<Category>**
...
**<Category>**

### Testing

(Areas of the app to test, then "Verify …" statements covering the new behaviour and that existing behaviour still works.)

- Verify ...
- Verify existing <feature> functionality continues to work as expected.

## Optional Notes

useful locations, edge cases and already-working scenarios, e.g. "If already claimed, show existing conflict messaging.")

## Optional Developers

implementation pointers: existing examples elsewhere in the app, method/service names to reuse.
