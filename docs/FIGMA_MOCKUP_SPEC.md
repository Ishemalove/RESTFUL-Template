# Figma Mockup Specification — User Registration / Signup

> **Task 1.3**: Design one page in Figma. Use this specification to recreate the mockup in Figma, or use the implemented React page at `/register` which follows this design.

## Canvas

- Frame: **Desktop** 1440 × 900 (responsive down to 375 mobile)
- Background: `#F0F4F8` (light gray-blue)

## Layout

- Centered card: **480px** width, white `#FFFFFF`, radius **16px**, shadow `0 8px 32px rgba(15, 23, 42, 0.08)`
- Logo area top: **XWZ Parking** wordmark, color `#0F766E` (teal)
- Subtitle: "Create your account" — 14px, `#64748B`

## Form Fields (User model)

| Label | Field | Placeholder | Type |
|-------|-------|-------------|------|
| First Name | firstName | John | text |
| Last Name | lastName | Doe | text |
| Email | email | you@example.com | email |
| Password | password | •••••••• | password |

- Label: 12px semibold `#334155`
- Input: height 44px, border `#E2E8F0`, focus ring `#0F766E`
- Spacing between fields: **16px**

## Actions

- Primary button: **Sign Up** — full width, `#0F766E`, white text, height 48px, radius 8px
- Secondary link: "Already have an account? **Log in**" — `#0F766E` link

## Role selector (implementation extension)

- Radio or dropdown: **Parking Attendant** (default) | **Admin** (for demo; production may restrict admin creation)

## States

- Error: red border `#DC2626`, message below field
- Loading: button disabled + spinner
- Success: redirect to login with toast

## Mobile (375px)

- Card full width minus 32px margin
- Stack fields vertically

## Export for Figma

1. Create frame "Signup"
2. Add auto-layout vertical card
3. Use components: Input, Button, Link
4. Prototype: Sign Up → Login screen (optional)

The live implementation mirrors this spec in `frontend/src/pages/RegisterPage.jsx`.
