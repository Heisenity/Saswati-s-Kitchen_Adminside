# AGENTS.md — Saswati's Kitchen Admin

## 1. Mission

This repository contains the Saswati's Kitchen Admin Control Portal.

The Admin Portal is the central operations and business-control interface for a larger system consisting of:

```text
Admin Web Portal
Customer Mobile App
Rider Mobile App
Shared Supabase Backend
```

Changes in this repository must preserve compatibility with the planned Customer and Rider applications.

Before implementing a feature, understand its domain impact.

---

# 2. Required Reading

Before making meaningful architectural or business-logic changes, read:

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/BUSINESS_RULES.md
docs/DELIVERY_ENGINE.md
docs/UI_GUIDELINES.md
```

These documents are part of the project's source of truth.

Do not silently contradict them.

If code and documentation conflict, identify the conflict before changing established business behavior.

---

# 3. Approved V1 Stack

Use:

```text
Next.js
App Router
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
React Hook Form
Zod
Supabase
PostgreSQL
Supabase Auth
Supabase Realtime
Supabase Storage
Supabase Edge Functions
```

Charts, when actually needed:

```text
Recharts
```

---

# 4. Do Not Introduce Unnecessary Infrastructure

Do not add these unless a concrete technical requirement exists and the reason is documented:

```text
Express
NestJS
MongoDB
Firebase
Prisma
Redux
Redis
Kafka
RabbitMQ
Kubernetes
custom microservices
AWS infrastructure
```

These technologies are not permanently forbidden.

They are intentionally excluded from V1 complexity.

---

# 5. Architecture Rules

The shared Supabase backend is the source of truth.

Admin controls:

```text
menu
selling prices
food costs
availability
orders
delivery configuration
target margin
delivery providers
riders
```

Customer/Rider applications consume that backend state.

Do not duplicate business truth in frontend constants.

---

# 6. Dynamic Margin Rule

This rule is non-negotiable.

The delivery target margin is Admin-configurable.

Never write business logic equivalent to:

```ts
const TARGET_MARGIN = 0.25;
```

25% is only an example/default business value.

Always obtain the active value from trusted backend configuration.

Example:

```text
delivery_settings.target_margin
```

Every selected quote and confirmed order must snapshot:

```text
target_margin_used
```

Existing confirmed orders are never repriced because Admin changes the current margin.

---

# 7. Business Logic Location

Sensitive or authoritative calculations belong server-side.

Examples:

```text
delivery pricing
profit/margin calculation
provider selection
food-cost calculation
rider payout
order total verification
payment verification
third-party booking
```

Frontend calculation may be used for display previews only.

Server results remain authoritative.

---

# 8. Never Trust Client Financial Inputs

Do not trust customer/frontend-provided:

```text
selling price
food cost
target margin
provider cost
delivery subsidy
final total
```

Use IDs and quantities from the request and load authoritative values server-side.

---

# 9. Money Representation

Store authoritative money as integer paise.

Example:

```text
₹159
=
15900
```

Do not use unsafe floating-point arithmetic for final financial calculations.

Provide centralized helpers for:

```text
paise → formatted INR
INR input → paise
round-up calculations
```

---

# 10. Canonical Order Statuses

Use only:

```text
PENDING
CONFIRMED
PREPARING
READY_FOR_PICKUP
RIDER_ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Do not introduce variants such as:

```text
ready
on_way
completed
accepted_order
```

without intentionally changing the domain model.

---

# 11. Canonical Delivery Statuses

Use only:

```text
QUOTE_CREATED
BOOKING_REQUESTED
RIDER_ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
FAILED
```

Third-party provider statuses must be normalized.

---

# 12. Delivery Modes

Supported:

```text
AUTOMATIC
OWN_ONLY
THIRD_PARTY_ONLY
```

Do not add hidden fallback behavior that violates the explicitly selected mode.

---

# 13. Provider Architecture

All delivery providers must use a common adapter abstraction.

Expected provider implementations:

```text
OwnDeliveryProvider
PorterProvider
UberDirectProvider
RapidoProvider
```

Do not scatter:

```ts
if (provider === ...)
```

throughout unrelated modules.

Provider-specific behavior belongs in provider-specific code.

---

# 14. Provider Secrets

Never expose:

```text
Porter secrets
Uber secrets
Rapido secrets
payment secrets
Supabase service-role key
```

inside:

```text
NEXT_PUBLIC_ variables
browser bundles
Customer APK
Rider APK
```

Secrets remain server-side.

---

# 15. Supabase Security

Every exposed business table must use appropriate Row Level Security.

Do not assume:

```text
authenticated = authorized
```

An authenticated user is not automatically an Admin.

Admin authorization must be verified using trusted backend/database state.

Do not use user-editable metadata for privileged authorization decisions.

---

# 16. Supabase Key Rules

Public/browser code may use only the appropriate public/publishable client credentials.

Never expose the service-role/secret key.

Any environment variable prefixed with:

```text
NEXT_PUBLIC_
```

must be assumed visible to the browser.

---

# 17. RLS Rules

When creating or modifying an exposed table:

```text
1. Enable RLS.
2. Define required access.
3. Implement policies.
4. Test authorized access.
5. Test unauthorized access.
```

Do not solve permission problems by disabling RLS.

---

# 18. RLS Authorization

`TO authenticated` alone is not sufficient authorization for sensitive rows.

Policies must include the required ownership/role condition.

For user-owned resources, use appropriate ownership checks.

For Admin-only resources, verify trusted Admin authorization.

---

# 19. RLS Update Policies

When implementing UPDATE policies, ensure both read eligibility and new-row validation are correctly considered.

Do not create policies that allow users to reassign ownership fields improperly.

---

# 20. Database Views / Privileged Functions

Be cautious with database views and privileged functions.

Do not add `SECURITY DEFINER` merely to bypass permission problems.

If privileged database code is genuinely required:

```text
document why
restrict execution
validate caller authorization
review security impact
```

---

# 21. Database Migrations

Schema changes must be represented in migrations.

Do not make undocumented schema changes.

Migration intent must be clear.

Examples:

```text
create_catalog_tables
create_order_tables
create_delivery_settings
add_target_margin_snapshot
```

After database changes:

```text
review constraints
review RLS
review indexes
review security
```

---

# 22. Historical Data Integrity

Never make old orders depend on current configuration.

Orders must snapshot:

```text
item names
selling prices
food costs
delivery provider cost
customer delivery charge
delivery subsidy
target margin used
```

Menu or margin changes must not rewrite historical values.

---

# 23. Admin UI Philosophy

The Admin Portal is operational software.

Optimize for:

```text
clarity
speed
information density
safe actions
clear status
low error rate
```

Do not design it like the consumer website.

---

# 24. UI Component Rules

Prefer shadcn/ui components.

Examples:

```text
Button
Card
Table
Badge
Sheet
Dialog
DropdownMenu
Form
Input
Select
Switch
Tabs
Tooltip
Skeleton
```

Do not recreate mature primitives without a reason.

---

# 25. Add/Edit UX

Prefer a Sheet for common CRUD workflows such as:

```text
Add Dish
Edit Dish
Add Rider
Edit Provider
```

Use Dialog for:

```text
confirmations
small actions
dangerous actions
```

Use a full page for complex workflows only.

---

# 26. Visual Design Rules

Admin visual style:

```text
professional
compact
modern SaaS
warm-neutral brand influence
restrained
accessible
```

Avoid:

```text
excessive gradients
glassmorphism everywhere
giant KPI cards
unnecessary hero sections
random shadows
random radii
random status colors
decorative animations
```

---

# 27. Responsive Rules

Design desktop-first.

Admin must remain usable on smaller devices, but do not destroy desktop operational density solely to optimize for tiny screens.

On mobile:

```text
sidebar → drawer
tables → responsive table/card representation
```

---

# 28. Forms

Use:

```text
React Hook Form
+
Zod
```

All mutations must validate server-side as well.

Client validation improves UX but is not security.

---

# 29. Validation

Validate:

```text
required fields
money values
quantities
margin
enum values
IDs
state transitions
```

Reject invalid domain transitions.

---

# 30. TypeScript

Use strict TypeScript.

Avoid:

```ts
any
```

unless there is a documented interoperability reason.

Prefer domain types.

Example:

```ts
type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";
```

---

# 31. Feature-Based Organization

Prefer:

```text
features/menu
features/orders
features/delivery
features/riders
features/settings
```

Avoid putting unrelated domain logic into shared utility files.

---

# 32. Shared Code

Only promote code to shared/common modules when it is genuinely reused.

Do not prematurely create abstraction layers for one-use code.

---

# 33. Server Components

Prefer Server Components for:

```text
initial data fetching
read-heavy pages
server-only operations
```

Do not mark entire pages `"use client"` unnecessarily.

---

# 34. Client Components

Use Client Components where interaction requires them.

Examples:

```text
forms
dialogs
sheets
filters
switches
realtime subscriptions
interactive tables
```

Keep client boundaries small.

---

# 35. Edge Functions

Use Edge Functions for sensitive multi-step operations.

Primary examples:

```text
calculate-delivery-quote
create-order
assign-rider
create-delivery
delivery-webhook
```

Keep each function focused.

Move shared domain code into reusable function modules where appropriate.

---

# 36. Delivery Quote Behavior

Quote flow:

```text
validate request
load authoritative menu data
calculate food subtotal
calculate food cost
load delivery settings
load dynamic margin
resolve delivery provider
calculate customer contribution
round upward
persist quote
return safe response
```

Do not leak private financial data.

---

# 37. Third-Party Quote Resilience

One provider error should not automatically fail the entire quote operation.

Use isolated error handling.

Where appropriate:

```ts
Promise.allSettled(...)
```

is preferable to a pattern where one rejected provider request cancels every other quote.

---

# 38. Quote Expiry

Third-party quote expiry must be respected.

Before booking:

```text
validate quote
or
refresh quote
```

Never book an expired quote blindly.

---

# 39. Webhooks

Webhook handlers must:

```text
verify request authenticity where provider supports it
be idempotent
store useful event data
normalize status
avoid duplicate side effects
```

Do not trust webhook payloads without provider-specific verification.

---

# 40. Realtime

Use Realtime selectively for:

```text
orders
rider availability
delivery updates
```

Do not enable realtime globally without product need.

---

# 41. Audit Logging

Sensitive Admin changes must create audit records.

At minimum:

```text
margin changes
price changes
food-cost changes
delivery-mode changes
provider enable/disable
order cancellation
manual rider assignment
```

---

# 42. Logging

Log enough information for debugging.

Prefer structured logs.

Useful:

```text
request ID
order ID
quote ID
delivery ID
provider code
operation
duration
result
```

Never log:

```text
API secrets
passwords
tokens
full payment credentials
```

---

# 43. Error Handling

User-facing errors should be understandable.

Do not expose raw stack traces.

Example:

Bad:

```text
PostgrestError 42501
```

Better:

```text
You don't have permission to update this setting.
```

Technical details may be logged server-side.

---

# 44. Loading / Empty / Error States

Every meaningful async UI must have:

```text
loading
empty
success
error
```

behavior.

Do not leave blank panels.

---

# 45. Destructive Actions

Require explicit confirmation for:

```text
Cancel Order
Disable all delivery methods
Deactivate rider
Disable provider
Large margin changes
```

---

# 46. No Fake Production Data

Mock data is permitted only during explicitly identified development/prototyping work.

Do not present mock analytics as production data.

Do not hardcode fake live-order values into final pages.

---

# 47. Testing Expectations

When changing logic, add or update appropriate tests.

High-priority test domains:

```text
delivery margin calculations
rounding
order transitions
authorization
RLS-sensitive behavior
provider selection
quote expiry
provider fallback
historical snapshots
```

---

# 48. Delivery Engine Test Cases

Always consider:

```text
Own rider available
Own rider unavailable
AUTOMATIC fallback
OWN_ONLY failure
THIRD_PARTY_ONLY
No providers available
Provider timeout
Provider error
Different target margins
Free delivery case
Paid delivery case
Quote expiry
Fallback within variance
Fallback beyond variance
```

---

# 49. Validation Commands

Before finishing a meaningful task:

1. Inspect `package.json`.
2. Use the scripts available in the repository.
3. Run relevant checks.

Expected commands may include:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Do not invent missing scripts solely to claim validation.

If a check cannot be run, report why.

---

# 50. Supabase Changes

After Supabase schema/security changes:

```text
review migration
review RLS
review policies
review indexes
run available database/security advisors
test access behavior
```

A schema change is not complete merely because SQL executed successfully.

---

# 51. Do Not Change Unrelated Code

When completing a scoped task:

```text
modify only what is necessary
```

Avoid opportunistic large refactors unless they are required to safely complete the task.

---

# 52. Preserve Existing Behavior

Before changing established behavior:

```text
inspect current implementation
identify dependencies
understand business effect
```

Do not overwrite working business logic just because another implementation looks cleaner.

---

# 53. Documentation Updates

Update docs when changing:

```text
architecture
database model
business rules
delivery algorithm
Admin workflows
security assumptions
```

Documentation and implementation should stay aligned.

---

# 54. Codex Task Workflow

For each requested task:

```text
1. Inspect relevant repository files.
2. Read applicable docs.
3. Identify affected domain.
4. Make the smallest coherent implementation.
5. Validate types.
6. Run lint.
7. Run relevant tests.
8. Run build when appropriate.
9. Review diff.
10. Summarize changes.
```

---

# 55. Post-Task Response

After implementing a task, report:

```text
What changed
Files changed
Business behavior affected
Tests/checks run
Any migration created
Any security impact
Any unresolved issue
```

Do not claim success if tests/build failed.

---

# 56. Current V1 Implementation Order

Follow this order unless explicitly instructed otherwise:

```text
1. Repository foundation
2. Supabase connection
3. Database + RLS foundation
4. Admin authentication
5. Admin shell
6. Menu Management
7. Order Management
8. Delivery Control
9. Dynamic Margin
10. Rider Management
11. Realtime
12. Operational Dashboard
13. Audit hardening
14. Customer App integration
15. Rider App integration
16. Porter
17. Uber Direct
18. Rapido after official access
```

---

# 57. Current Product Non-Negotiables

Never violate these without explicit approval:

```text
One shared Supabase backend.

Admin is the control plane.

Delivery margin is configurable.

25% is not hardcoded.

Confirmed orders preserve the margin used.

Food cost is private.

Sensitive delivery calculations run server-side.

Customer App never directly calls delivery providers.

Provider secrets never enter frontend/mobile code.

Third-party providers use adapters.

Provider statuses are normalized.

Historical orders are immutable financial snapshots.

RLS protects exposed data.

Sensitive Admin actions are audited.
```

---

# 58. Decision Rule

When choosing between:

```text
more technology
```

and:

```text
a simpler implementation that safely meets current requirements
```

prefer the simpler implementation.

Add complexity only when the current product genuinely requires it.