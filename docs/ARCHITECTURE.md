# Saswati's Kitchen — System Architecture

## 1. Purpose

This document defines the technical architecture for the Saswati's Kitchen digital ordering, administration, rider-management, and home-delivery platform.

The platform consists of three primary applications:

1. **Admin Web Portal**
2. **Customer Mobile App**
3. **Rider Mobile App**

All three applications use one shared backend powered by Supabase.

The **Admin Web Portal is the control plane of the system**.

The Admin Web Portal controls:

* Menu
* Categories
* Selling prices
* Food costs
* Dish availability
* Lunch/dinner availability
* Orders
* Riders
* Own-delivery availability
* Delivery mode
* Third-party delivery providers
* Delivery pricing configuration
* Dynamic target margin
* Delivery fee rounding
* Operational settings
* Audit history
* Future reporting and analytics

The **Customer Mobile App** consumes:

* Menu
* Customer-facing prices
* Dish availability
* Categories
* Offers
* Customer profile information
* Delivery address information
* Final backend-calculated home-delivery charge
* Final order total
* Order status
* Order history
* Customer-facing notifications

The Customer App **does not select or control the delivery provider**.

The customer simply:

```text
Selects food
    ↓
Confirms delivery address
    ↓
Reviews final price
    ↓
Places order
    ↓
Tracks order status
```

The **Rider Mobile App** is used by Saswati's Kitchen's own internal riders and consumes:

* Rider profile
* Availability
* Assigned deliveries
* Pickup information
* Customer delivery information
* Delivery workflow
* Delivery history
* Rider payout information where applicable

All business-critical calculations, delivery-provider decisions, and sensitive operations must be performed on the backend.

---

# 2. System Architecture

```text
                         SASWATI'S KITCHEN

                    ┌───────────────────────┐
                    │    ADMIN WEB APP      │
                    │                       │
                    │ Next.js               │
                    │ TypeScript            │
                    │ Tailwind CSS          │
                    │ shadcn/ui             │
                    └───────────┬───────────┘
                                │
                                │
                         Controls Business
                           Configuration
                                │
                                ▼
                 ┌─────────────────────────────┐
                 │          SUPABASE           │
                 │                             │
                 │ PostgreSQL                  │
                 │ Supabase Auth               │
                 │ Row Level Security          │
                 │ Realtime                    │
                 │ Storage                     │
                 │ Edge Functions              │
                 └──────────────┬──────────────┘
                                │
               ┌────────────────┴────────────────┐
               │                                 │
               ▼                                 ▼
      ┌───────────────────┐             ┌───────────────────┐
      │   CUSTOMER APP    │             │    RIDER APP      │
      │                   │             │                   │
      │ React Native      │             │ React Native      │
      │ Expo              │             │ Expo              │
      │ TypeScript        │             │ TypeScript        │
      └─────────┬─────────┘             └─────────▲─────────┘
                │                                 │
                │ Checkout / Orders               │
                │                                 │
                ▼                                 │
      ┌────────────────────────────────────────────────────┐
      │              DELIVERY ORCHESTRATOR                 │
      │                                                    │
      │            Supabase Edge Functions                 │
      │                                                    │
      │ Reads Admin delivery settings                      │
      │ Determines delivery method internally              │
      │ Calculates actual delivery cost                    │
      │ Applies Admin-selected target margin               │
      │ Calculates customer home-delivery charge           │
      └─────────────────────────┬──────────────────────────┘
                                │
                 ┌──────────────┴───────────────┐
                 │                              │
                 ▼                              ▼
         ┌───────────────┐             ┌─────────────────┐
         │ OWN DELIVERY  │             │  THIRD PARTY    │
         └───────┬───────┘             └────────┬────────┘
                 │                               │
                 ▼                         ┌─────┼─────┐
       Saswati's Kitchen Rider             │     │     │
                 │                         ▼     ▼     ▼
                 ▼                      Porter Uber Rapido
          Rider Assignment
                 │
                 ▼
             Rider App
```

---

# 3. Technology Stack

## 3.1 Admin Web Application

Use:

* Next.js
* App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* React Hook Form
* Zod

The Admin Portal should be desktop-first, responsive, compact, and designed as professional operational SaaS software.

---

## 3.2 Backend Platform

Use:

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security
* Supabase Realtime
* Supabase Storage
* Supabase Edge Functions

Supabase is the shared backend for:

```text
Admin Web Portal
Customer Mobile App
Rider Mobile App
Delivery Engine
Future provider integrations
```

---

## 3.3 Customer Mobile Application

Planned stack:

* React Native
* Expo
* TypeScript
* Expo Router
* TanStack Query / React Query
* React Hook Form
* Zod
* Expo Location
* Expo Notifications

---

## 3.4 Rider Mobile Application

Planned stack:

* React Native
* Expo
* TypeScript
* Expo Router
* TanStack Query / React Query
* Expo Location
* Expo Notifications

---

# 4. Core Architectural Principles

## 4.1 One Shared Backend

Do not create separate databases for:

```text
Admin
Customer App
Rider App
```

All applications use the same Supabase project.

```text
                 SUPABASE

        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
      Admin      Customer      Rider
```

Supabase is the canonical source of truth.

---

## 4.2 Admin Defines Business State

The Admin application controls business configuration.

Examples:

```text
Menu
Categories
Selling price
Food cost
Dish availability
Lunch/dinner availability

Delivery mode
Own delivery ON/OFF

Porter ON/OFF
Uber Direct ON/OFF
Rapido ON/OFF

Target delivery margin
Delivery fee rounding

Rider management
Order management
Business settings
```

The Customer App and Rider App must not maintain independent authoritative versions of these settings.

---

## 4.3 Backend Is Authoritative

The frontend must never be authoritative for:

* Delivery pricing
* Profit-margin calculations
* Food-cost calculations
* Delivery subsidy calculations
* Delivery-provider selection
* Order total verification
* Rider payout calculation
* Payment verification
* Sensitive delivery configuration
* Provider availability
* Provider costs

These belong on the backend.

---

## 4.4 Customer Has No Delivery Provider Control

This is a non-negotiable architectural rule.

The Customer App must never contain:

```text
Choose Delivery Provider

○ Saswati's Kitchen Rider
○ Porter
○ Uber
○ Rapido
```

The customer has no provider-selection capability.

Delivery selection is an internal operational process controlled by:

```text
Admin Configuration
        +
Backend Logic
```

---

# 5. Backend Responsibility Model

The backend has two broad categories of operations.

## 5.1 Direct Supabase Operations

Simple, permission-controlled CRUD operations may use Supabase directly.

Examples:

```text
Admin reads menu
Admin reads categories
Admin reads orders
Admin reads riders

Customer reads available menu
Customer reads own orders
Customer reads own addresses

Rider reads own profile
Rider reads assigned delivery
```

These operations must still be protected by appropriate Row Level Security.

---

## 5.2 Supabase Edge Functions

Sensitive or multi-step business operations use Supabase Edge Functions.

Primary planned functions:

```text
calculate-delivery-quote

create-order

assign-rider

create-delivery

cancel-delivery

delivery-webhook

payment-webhook
```

Possible future functions:

```text
auto-assign-rider

calculate-route-batch

process-delivery-fallback

reconcile-delivery

verify-payment

send-order-notification
```

---

# 6. Customer Checkout Architecture

The Customer App sends only customer-controlled input and identifiers.

Example:

```text
Selected menu item IDs
Quantities
Delivery address ID
Customer notes
Payment option
```

The Customer App must not send authoritative:

```text
Selling price
Food cost
Target margin
Provider
Provider cost
Delivery subsidy
Final total
```

The backend recalculates and validates all financial values.

Conceptual flow:

```text
CUSTOMER APP
     │
     │ Selected items + address
     ▼
BACKEND
     │
     ├── Validate menu items
     ├── Validate availability
     ├── Load selling prices
     ├── Load food costs
     ├── Read delivery settings
     ├── Determine delivery method
     ├── Calculate delivery cost
     ├── Apply Admin margin
     ├── Calculate customer delivery charge
     └── Calculate final total
     │
     ▼
CUSTOMER APP
```

The Customer App receives only the customer-facing result.

Example:

```text
Chicken Thali × 2        ₹318

Home Delivery             ₹30

──────────────────────────────

Total                    ₹348
```

---

# 7. Delivery Architecture

Delivery is handled through a centralized backend:

```text
Delivery Orchestrator
```

The Delivery Orchestrator is implemented through server-side business logic using Supabase Edge Functions.

The customer has no role in selecting:

```text
Own Rider
Porter
Uber Direct
Rapido
```

The backend selects the delivery method according to Admin settings and current operational conditions.

---

## 7.1 Delivery Orchestrator Flow

```text
                     CUSTOMER APP
                          │
                          │
                    Checkout Request
                          │
                          ▼
                calculate-delivery-quote
                          │
                          ▼
                DELIVERY ORCHESTRATOR
                          │
                          ▼
                  Read Admin Settings
                          │
                          ▼
                Determine Delivery Mode
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      OWN DELIVERY               THIRD PARTY
             │                         │
             │                 ┌───────┼───────┐
             │                 │       │       │
             ▼                 ▼       ▼       ▼
      Saswati Rider         Porter   Uber   Rapido
             │                 │       │       │
             └────────────┬────┴───────┴───────┘
                          │
                          ▼
                  SELECT BEST VIABLE
                      INTERNALLY
                          │
                          ▼
                  APPLY ADMIN MARGIN
                          │
                          ▼
               CALCULATE HOME-DELIVERY
                        CHARGE
                          │
                          ▼
                     CUSTOMER APP
```

The Customer App sees only:

```text
Home Delivery
Final Delivery Charge
Final Order Total
```

---

# 8. Admin Delivery Control

The Admin Portal determines how the delivery system is allowed to operate.

Example:

```text
DELIVERY CONTROL


Delivery Mode

● Automatic

○ Own Delivery Only

○ Third Party Only


Own Delivery

● Enabled


Third-Party Providers

Porter
● Enabled

Uber Direct
● Enabled

Rapido
○ Disabled


Delivery Pricing

Target Margin
28%

Rounding
Nearest upward ₹5
```

These settings exist only in Admin.

The Customer App cannot read or modify operational delivery configuration except for the final customer-facing result.

---

# 9. Delivery Modes

Supported delivery modes:

```text
AUTOMATIC
OWN_ONLY
THIRD_PARTY_ONLY
```

Stored conceptually in:

```text
delivery_settings.delivery_mode
```

Only authorized Admin users may change the active delivery mode.

---

## 9.1 AUTOMATIC Mode

Recommended production mode.

```text
                    AUTOMATIC
                        │
                        ▼
             Own Delivery Enabled?
                        │
                 ┌──────┴──────┐
                 │             │
                YES            NO
                 │             │
                 ▼             │
       Own Delivery Capacity?  │
                 │             │
            ┌────┴────┐        │
            │         │        │
           YES        NO       │
            │         │        │
            ▼         └────────┼─────────┐
      OWN DELIVERY             │         │
                               ▼         │
                      THIRD-PARTY ◄──────┘
                               │
                               ▼
                     Enabled Providers
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                 Porter      Uber       Rapido
                    │          │          │
                    └──────────┼──────────┘
                               ▼
                         Valid Quotes
                               │
                               ▼
                     Select Best Viable
                               │
                               ▼
                       Delivery Cost
                               │
                               ▼
                    Apply Admin Margin
                               │
                               ▼
                  Customer Delivery Charge
```

The customer does not see any internal decision.

---

## 9.2 OWN_ONLY Mode

When Admin selects:

```text
OWN_ONLY
```

only Saswati's Kitchen's internal delivery system may be used.

```text
Customer Checkout
       ↓
Own Delivery Enabled?
       ↓
Own Delivery Available?
       │
       ├── YES
       │     ↓
       │ Continue
       │
       └── NO
             ↓
      Home Delivery Unavailable
```

The backend must not silently use:

```text
Porter
Uber Direct
Rapido
```

when `OWN_ONLY` is active.

---

## 9.3 THIRD_PARTY_ONLY Mode

When Admin selects:

```text
THIRD_PARTY_ONLY
```

the backend ignores Saswati's own delivery system for new delivery selection.

Example Admin configuration:

```text
Porter       ON
Uber Direct  ON
Rapido       OFF
```

Backend:

```text
Request Porter quote

Request Uber Direct quote

Do NOT request Rapido
```

The backend internally selects the best valid option.

---

# 10. Third-Party Delivery Quotes

A third-party quote means:

> Ask an enabled external provider what it would cost to perform the delivery.

Example internal results:

```text
Porter
₹72

Uber Direct
₹84
```

The customer does not see:

```text
Porter ₹72

Uber ₹84
```

The backend uses the quote internally.

---

## 10.1 Quote vs Booking

Getting a quote is not the same as booking delivery.

```text
QUOTE

"How much would this delivery cost?"
```

is different from:

```text
BOOKING

"Create this delivery and send a rider."
```

Recommended flow:

```text
Customer Checkout
       ↓
Calculate delivery options internally
       ↓
Obtain provider quote if required
       ↓
Calculate customer delivery charge
       ↓
Customer confirms order/payment
       ↓
Revalidate selected delivery method
       ↓
Create delivery
```

---

# 11. Provider Eligibility

The cheapest provider is not automatically valid.

Before provider selection, backend verifies:

```text
Provider enabled?

Pickup location supported?

Delivery location supported?

Required delivery type supported?

Valid quote returned?

Quote not expired?

Provider available?

Booking can be created?
```

Only eligible providers participate in selection.

---

# 12. Provider Selection

V1 provider selection prioritizes:

```text
Validity
Serviceability
Availability
Successful quote
Actual delivery cost
```

Among valid providers, the backend selects the lowest viable cost.

The customer never participates in this decision.

---

# 13. No Customer-Facing ETA

Saswati's Kitchen is based on home delivery.

The Customer App does not need to display or guarantee an ETA.

Do not build customer-facing UI such as:

```text
Estimated delivery: 35–45 min

Arriving at 1:25 PM

42 minutes remaining

Expected delivery time
```

unless this product requirement is explicitly changed later.

Instead, customer tracking uses order status.

```text
Order Confirmed
       ↓
Preparing
       ↓
Rider Assigned
       ↓
Out for Delivery
       ↓
Delivered
```

---

## 13.1 Internal ETA

If a third-party provider returns ETA data through its API, the backend may store or use it internally for:

```text
Provider evaluation
Operational monitoring
Admin visibility
Debugging
Future analytics
```

But ETA is not part of the required customer-facing contract.

---

# 14. Delivery Provider Adapter Architecture

Every delivery method should implement a common conceptual interface.

```ts
interface DeliveryProvider {
  getQuote(
    request: DeliveryQuoteRequest
  ): Promise<DeliveryQuote>;

  createDelivery(
    request: CreateDeliveryRequest
  ): Promise<Delivery>;

  getStatus(
    deliveryId: string
  ): Promise<DeliveryStatus>;

  cancelDelivery(
    deliveryId: string
  ): Promise<void>;

  normalizeStatus(
    providerStatus: string
  ): InternalDeliveryStatus;
}
```

Expected implementations:

```text
OwnDeliveryProvider

PorterProvider

UberDirectProvider

RapidoProvider
```

---

## 14.1 Provider Registry

Provider-specific conditions must not be scattered throughout the application.

Avoid:

```ts
if (provider === "porter") {
  ...
}

if (provider === "uber") {
  ...
}
```

across unrelated modules.

Instead use a provider registry.

Conceptually:

```ts
const provider =
  providerRegistry.get(providerCode);

await provider.getQuote(request);
```

---

# 15. Own Rider Assignment

Selecting:

```text
OWN DELIVERY
```

does not automatically mean a specific rider has already been selected.

Delivery-method selection and actual rider assignment are separate concerns.

Recommended V1 workflow:

```text
Customer Order Confirmed
       ↓
Kitchen Preparing
       ↓
Order Ready / Near Ready
       ↓
Admin Opens Rider Assignment
       ↓
Available Riders
       ↓
Admin Assigns Rider
       ↓
Rider App Receives Delivery
```

Example:

```text
AVAILABLE RIDERS

Rahul
● Available

Amit
● Available

Rohan
○ Busy

[ Assign Rahul ]
```

V1 uses manual Admin assignment.

Future versions may support automatic rider assignment.

---

# 16. Third-Party Rider Assignment

When a provider such as:

```text
Porter
Uber Direct
Rapido
```

is selected, Saswati's Kitchen selects the **provider**, not the individual external rider.

Example:

```text
Backend selects Porter
       ↓
Create Porter Delivery
       ↓
Porter
       ↓
Porter assigns rider
```

Similarly:

```text
Backend selects Uber Direct
       ↓
Uber assigns courier
```

External provider rider assignment is controlled by that provider.

---

# 17. Dynamic Delivery Margin

The target delivery margin is controlled by Admin.

It must never be permanently hardcoded.

Incorrect:

```ts
const TARGET_MARGIN = 0.25;
```

Correct:

```text
Admin
  ↓
Delivery Pricing
  ↓
Target Margin
28%
  ↓
delivery_settings.target_margin
```

The backend reads the currently active value for each new delivery calculation.

---

# 18. Margin Changes

Example:

```text
Current Margin
25%

Admin changes:

25% → 28%
```

After saving:

```text
New delivery calculations
use 28%
```

No application deployment is required.

Previously confirmed orders remain unchanged.

---

# 19. Margin Snapshot

Every selected delivery quote must store:

```text
target_margin_used
```

Every confirmed order must also store:

```text
target_margin_used
```

Example:

```text
Monday

Margin = 25%

Order SK1001
Margin used = 25%


Tuesday

Admin changes margin = 30%


Order SK1001
still = 25%


New Order SK1002
Margin used = 30%
```

Historical orders must never be silently repriced.

---

# 20. Delivery Pricing Formula

Definitions:

```text
F = Food subtotal

C = Food cost

D = Actual delivery cost

M = Admin-selected target margin
```

Minimum required revenue:

```text
R =
(C + D)
/
(1 - M)
```

Minimum customer delivery contribution:

```text
X =
R - F
```

Before rounding:

```text
Customer Delivery Charge =
max(0, X)
```

Then apply the Admin-configured upward rounding rule.

---

# 21. Delivery Rounding

Example:

```text
Calculated customer delivery charge
₹48.67

Configured rounding
Up to nearest ₹5

Final customer home-delivery charge
₹50
```

Rounding must never reduce the delivery charge below the amount required to protect the configured margin.

---

# 22. Own Delivery Cost

Own delivery has a real internal cost.

Example:

```text
Internal rider payout
₹40
```

The Delivery Engine uses:

```text
₹40
```

as the delivery cost for the margin calculation.

Own delivery is not automatically zero-cost to Saswati's Kitchen.

---

# 23. Third-Party Delivery Cost

For third-party delivery:

```text
Actual Delivery Cost
=
Selected Provider Quote
```

Example:

```text
Selected Porter Quote
₹72
```

The customer does not necessarily pay ₹72.

The backend determines the customer contribution based on:

```text
Food subtotal
Food cost
Provider cost
Admin-selected target margin
Rounding rule
```

---

# 24. Delivery Subsidy

Conceptually:

```text
Actual Delivery Cost
-
Customer Delivery Charge
=
Business Delivery Subsidy
```

This value is internal financial information.

It may be stored for reporting and analytics.

---

# 25. Customer-Facing Delivery Data

Customer App may receive:

```text
Home delivery available / unavailable

Home-delivery charge

Final order total

Order status

Rider/customer-contact information when appropriate
```

Customer App must not receive unnecessary internal values such as:

```text
Food cost

Target margin

Provider cost

Delivery subsidy

Internal rider payout

All provider quotes

Provider-selection reasoning

Provider API credentials
```

---

# 26. Customer Provider Visibility

At checkout, the delivery label should be:

```text
Home Delivery
```

not:

```text
Porter Delivery

Uber Delivery

Rapido Delivery

Saswati Rider Delivery
```

Provider identity remains an internal operational concern unless a later requirement makes it necessary to expose specific rider/tracking information.

---

# 27. Delivery Failure Handling

If:

```text
Own delivery unavailable

AND

No enabled third-party provider can fulfill delivery
```

backend returns:

```text
HOME_DELIVERY_UNAVAILABLE
```

Customer-facing UI may display:

```text
Home delivery is temporarily unavailable
for this location.
```

The system must not create a normal delivery order if no viable delivery mechanism exists.

---

# 28. Third-Party Booking Failure

If the initially selected provider fails during actual booking:

```text
Selected Provider
       ↓
Booking Failed
       ↓
Check Other Valid Stored Quotes
       ↓
Alternative Available?
       │
       ├── YES
       │      ↓
       │ Evaluate Fallback
       │
       └── NO
              ↓
       Request Fresh Quotes
```

---

# 29. Quote Variance Protection

Admin may configure:

```text
quote_variance_limit
```

Example:

```text
Original Delivery Cost
₹58

Fallback
₹62

Difference
₹4
```

If within configured tolerance:

```text
Automatic fallback may proceed
```

But:

```text
Original
₹58

Fallback
₹105
```

must not silently create a large unexpected business cost.

Such cases should require controlled handling.

---

# 30. Menu Architecture

```text
ADMIN
   │
   │ Create / Edit
   ▼
Supabase
   │
   ▼
CUSTOMER APP
```

Example:

```text
Admin

Chicken Thali

Selling Price
₹159

Available
YES
```

Customer sees:

```text
Chicken Thali

₹159

ADD
```

---

# 31. Menu Price Changes

If Admin changes:

```text
₹159 → ₹169
```

new customer views use:

```text
₹169
```

Previously confirmed orders preserve:

```text
₹159
```

if that was the price used at confirmation.

---

# 32. Food Cost

Admin maintains food cost independently of selling price.

Example:

```text
Selling Price
₹159

Food Cost
₹98
```

Food cost is private financial information.

It must not be available through customer-facing APIs.

---

# 33. Availability

Admin controls:

```text
AVAILABLE
UNAVAILABLE
```

If:

```text
Chicken Thali

Available
ON → OFF
```

Customer App should display:

```text
Sold Out
```

or:

```text
Unavailable
```

The item cannot be included in a new confirmed order while unavailable.

---

# 34. Meal Period

Menu items may belong to:

```text
LUNCH
DINNER
BOTH
```

The backend and Customer App must respect meal availability and Admin configuration.

---

# 35. Order Architecture

Canonical order flow:

```text
CUSTOMER APP
     │
     │ Place Order
     ▼
BACKEND
     │
     ├── Validate customer
     ├── Validate menu
     ├── Validate availability
     ├── Validate prices
     ├── Calculate food subtotal
     ├── Calculate food cost
     ├── Resolve delivery internally
     ├── Calculate delivery charge
     ├── Calculate final total
     └── Snapshot financial values
     │
     ▼
ORDER
     │
     ▼
ADMIN
     │
     ├── Confirm
     ├── Preparing
     └── Ready
           │
           ▼
     DELIVERY ASSIGNMENT
           │
      ┌────┴──────────────┐
      │                   │
      ▼                   ▼
Own Delivery        Third Party
      │                   │
      ▼                   ▼
Rider App        Provider System
      │                   │
      └──────────┬────────┘
                 ▼
              Picked Up
                 │
                 ▼
         Out for Delivery
                 │
                 ▼
             Delivered
```

---

# 36. Canonical Order Statuses

Use one controlled set:

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

Do not introduce arbitrary variations such as:

```text
ready

READY

on_way

finished

completed_order
```

without explicitly changing the domain model.

---

# 37. Customer-Facing Order Status

Customer status may be simplified to:

```text
Order Confirmed

Preparing

Rider Assigned

Out for Delivery

Delivered
```

No customer-facing ETA is required.

---

# 38. Canonical Delivery Statuses

Provider-specific delivery states must normalize into:

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

Example:

```text
Porter status ───┐
Uber status ─────┼──► Status Normalizer
Rapido status ───┤           │
Own Rider ───────┘           ▼
                       Internal Status
```

---

# 39. Realtime Architecture

Use Supabase Realtime selectively.

Recommended realtime events:

```text
New customer order

Order status changed

Rider availability changed

Rider assignment changed

Delivery status changed
```

Example:

```text
Customer App
     ↓
Creates order
     ↓
Supabase
     ↓
Realtime
     ↓
Admin receives order
```

Do not enable realtime on every table without a clear operational requirement.

---

# 40. Authentication Architecture

## Admin

V1:

```text
Email
+
Password
```

using Supabase Auth.

Authentication and authorization are separate.

Possible Admin roles:

```text
SUPER_ADMIN

OWNER

ADMIN

KITCHEN_MANAGER

ORDER_MANAGER

DELIVERY_MANAGER
```

---

# 41. Authorization Architecture

UI hiding is not sufficient security.

Do not rely only on:

```ts
if (user.role === "admin") {
  ...
}
```

Server/database authorization must independently verify whether the account has permission.

Row Level Security must protect exposed application tables.

---

# 42. Sensitive Permissions

Only authorized Admin roles may modify:

```text
Target margin

Food cost

Selling prices

Delivery mode

Provider availability

Own-delivery setting

Critical order state

Rider assignment overrides
```

These actions should be audited.

---

# 43. Storage Architecture

Use Supabase Storage for:

```text
Menu images

Category images

Future business assets
```

Suggested paths:

```text
menu-items/{menu_item_id}/cover.webp

categories/{category_id}/cover.webp
```

---

# 44. Audit Architecture

Sensitive Admin actions must generate audit records.

Examples:

```text
Menu selling price changed

Food cost changed

Target margin changed

Delivery mode changed

Own delivery enabled/disabled

Porter enabled/disabled

Uber Direct enabled/disabled

Rapido enabled/disabled

Order cancelled

Rider manually assigned
```

Every audit event should answer:

```text
Who?

What?

Which resource?

Old value?

New value?

When?
```

---

# 45. Admin Application Structure

Recommended:

```text
app/
├── (auth)/
│   └── login/
│
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/
│   ├── menu/
│   ├── orders/
│   ├── delivery/
│   ├── riders/
│   ├── customers/
│   └── settings/
│
components/
├── ui/
├── layout/
└── shared/
│
features/
├── auth/
├── menu/
├── orders/
├── delivery/
├── riders/
├── customers/
└── settings/
│
lib/
├── supabase/
├── auth/
├── validation/
├── constants/
└── utils/
│
types/
│
supabase/
├── migrations/
└── functions/
```

---

# 46. Feature Ownership

Group domain logic by feature.

Example:

```text
features/menu/

├── components/
├── schemas/
├── queries/
├── actions/
├── types/
└── utils/
```

Delivery provider code should remain isolated.

Possible structure:

```text
supabase/functions/_shared/delivery/

├── orchestrator/
│
├── providers/
│   ├── own-delivery.ts
│   ├── porter.ts
│   ├── uber-direct.ts
│   └── rapido.ts
│
├── pricing/
│
└── status/
```

Exact implementation may evolve while preserving separation of responsibilities.

---

# 47. Server vs Client Responsibilities

Prefer server-side data fetching where practical.

Use Client Components only where browser interactivity is required.

Examples:

```text
Dialogs

Sheets

Interactive forms

Filters

Switches

Realtime subscriptions

Optimistic interactions
```

Do not make every Next.js page:

```text
"use client"
```

without a requirement.

---

# 48. Admin UI Architecture

The Admin Portal is operational software.

Primary priorities:

```text
Speed

Clarity

Control

Operational visibility

Safe actions

Low error rate
```

The Admin UI should not copy the Customer App design directly.

Use subtle Saswati's Kitchen branding while maintaining a professional SaaS-style interface.

---

# 49. Admin Navigation

Recommended V1 navigation:

```text
SASWATI'S KITCHEN
Admin Control


Overview


OPERATIONS

Orders


CATALOG

Menu
Categories


DELIVERY

Delivery Control
Riders
Deliveries


CUSTOMERS

Customers


SYSTEM

Settings
```

V1 only needs routes that are genuinely functional.

Do not create fake completed sections.

---

# 50. Delivery Control UI

Admin Delivery Control should expose:

```text
Delivery Mode

Automatic
Own Delivery Only
Third Party Only


Own Delivery

Enabled / Disabled


Providers

Porter
Enabled / Disabled

Uber Direct
Enabled / Disabled

Rapido
Enabled / Disabled


Pricing

Target Margin

Delivery Fee Rounding

Quote Variance
```

These controls must not exist in the Customer App.

---

# 51. Dynamic Margin UI

Example:

```text
DELIVERY PRICING


Target Profit Margin

[ 28 ] %


Delivery Fee Rounding

[ Up to nearest ₹5 ▼ ]


Current Margin

28%


Last Updated

19 Aug 2026


[ Save Changes ]
```

Changing the margin affects **new delivery calculations only**.

Confirmed orders retain their original financial snapshot.

---

# 52. Rider Management Architecture

Riders have internal availability states.

Suggested:

```text
OFFLINE

AVAILABLE

BUSY

PAUSED
```

Admin can view:

```text
Rider
Availability
Current assignment
Delivery count
Payout
Delivery history
```

---

# 53. V1 Rider Assignment

V1 uses manual assignment.

```text
Order Ready
      ↓
Admin
      ↓
Available Riders
      ↓
Select Rider
      ↓
Assignment
      ↓
Rider App
```

Future versions may add:

```text
distance-based suggestion

load-based suggestion

automatic assignment

route batching
```

These should not be introduced until the manual workflow is proven.

---

# 54. `calculate-delivery-quote`

Conceptual responsibilities:

```text
Receive menu item IDs + quantities + address

        ↓

Validate menu

        ↓

Load authoritative selling prices

        ↓

Load authoritative food costs

        ↓

Read Admin delivery configuration

        ↓

Read active target margin

        ↓

Resolve delivery method internally

        ↓

Determine actual delivery cost

        ↓

Calculate customer home-delivery contribution

        ↓

Round upward according to configuration

        ↓

Persist quote

        ↓

Return customer-safe result
```

The function must not expose internal provider-selection data unnecessarily.

---

# 55. `create-order`

Conceptual responsibilities:

```text
Revalidate menu

Revalidate availability

Revalidate delivery quote

Recalculate / verify final totals

Snapshot item prices

Snapshot food costs

Snapshot delivery cost

Snapshot delivery charge

Snapshot target margin

Create order

Create order items

Create initial status history
```

Never trust a final total sent by the Customer App.

---

# 56. `assign-rider`

Used only for Saswati's Kitchen internal riders.

Responsibilities:

```text
Verify Admin authorization

Verify order is eligible for rider assignment

Verify rider is active

Verify rider is available

Create assignment

Mark rider BUSY where appropriate

Update order/delivery state

Notify Rider App
```

---

# 57. `create-delivery`

Used when actual delivery needs to be created.

Flow:

```text
Load selected delivery method

Validate quote

Validate provider availability

Create own delivery
OR
Create third-party delivery

Persist result

Update delivery status
```

---

# 58. `delivery-webhook`

Third-party provider webhook flow:

```text
Provider
   ↓
delivery-webhook
   ↓
Verify webhook
   ↓
Locate delivery
   ↓
Store event
   ↓
Normalize provider status
   ↓
Update delivery
   ↓
Update order status if required
   ↓
Realtime
   ↓
Admin / Customer App
```

Webhook handling must be idempotent.

---

# 59. Security Architecture

Never expose:

```text
Supabase service-role key

Provider API secrets

Payment gateway secrets

Webhook secrets

Private database credentials
```

inside:

```text
Browser JavaScript

Customer App APK

Rider App APK
```

Secrets stay server-side.

---

# 60. Row Level Security

RLS must be enabled on every exposed application table.

Access must be role/ownership appropriate.

## Customer

May access:

```text
Customer-facing menu data

Own profile

Own addresses

Own orders

Own delivery status
```

Must not access:

```text
Food costs

Target margin

Provider costs

Other customers

Audit logs

Internal rider payouts
```

## Rider

May access:

```text
Own rider profile

Own assignment

Required order/customer delivery information

Permitted delivery-status actions
```

Must not have unrestricted database access.

## Admin

Access depends on authorized Admin role.

---

# 61. Deployment

## Admin Web

Recommended:

```text
Vercel
```

Netlify is also acceptable.

---

## Backend

```text
Supabase Hosted Project
```

---

## Customer App

```text
React Native + Expo

      ↓

Expo EAS

      ↓

Android AAB

      ↓

Google Play
```

---

## Rider App

Initially:

```text
React Native + Expo

      ↓

Expo EAS

      ↓

Private APK

      ↓

Saswati's Kitchen Rider Devices
```

---

# 62. V1 Scope

Admin V1 includes:

```text
Authentication

Menu Management

Categories

Selling Prices

Food Costs

Availability

Order Management

Delivery Control

Own Delivery ON/OFF

Delivery Mode

Provider ON/OFF

Dynamic Target Margin

Delivery Rounding

Rider Management

Manual Rider Assignment

Settings

Basic Operational Dashboard

Audit Logging
```

---

# 63. Third-Party Integration Order

Recommended implementation order:

```text
PHASE 1

Own Delivery


PHASE 2

Porter


PHASE 3

Uber Direct


PHASE 4

Rapido

only after approved official
business/API integration is available
```

Do not attempt all provider integrations simultaneously.

---

# 64. Technologies Not Required for V1

Do not introduce without demonstrated need:

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

Microservices

AWS infrastructure
```

These technologies are not permanently prohibited.

They are intentionally excluded from V1 to avoid unnecessary operational and architectural complexity.

---

# 65. Future Scaling Strategy

If scale or operational complexity later requires a standalone backend, the system may evolve toward:

```text
Admin / Customer / Rider
        │
        ▼
Standalone Backend API
        │
        ├── Order Service
        ├── Delivery Service
        ├── Dispatch Service
        ├── Payment Service
        └── Notification Service
        │
        ├── PostgreSQL
        └── Redis / Queue
```

This architecture should only be introduced when justified by actual scale.

---

# 66. Architectural Non-Negotiables

1. One shared Supabase backend is the source of truth.

2. Admin is the business and operational control plane.

3. Customer App never controls delivery-provider selection.

4. Customer sees only **Home Delivery**, not a choice between Own Rider / Porter / Uber / Rapido.

5. Delivery-provider selection happens internally in the backend.

6. Admin controls delivery mode.

7. Admin controls own-delivery availability.

8. Admin controls which third-party providers are enabled.

9. Supported delivery modes are:

   * `AUTOMATIC`
   * `OWN_ONLY`
   * `THIRD_PARTY_ONLY`

10. Disabled providers must not be queried or booked.

11. In Automatic mode, own delivery may be preferred when internal delivery capacity is available.

12. Customer App never directly communicates with Porter, Uber Direct, Rapido, or another delivery provider.

13. Customer App never sends a preferred provider.

14. Customer App never sends an authoritative delivery cost.

15. Customer App never sends an authoritative target margin.

16. Customer App never sends authoritative selling prices or food costs.

17. No customer-facing ETA is required.

18. Customer delivery tracking is status-based.

19. Provider-returned ETA may remain internal.

20. Delivery target margin is Admin-configurable.

21. Target margin must never be permanently hardcoded to 25%.

22. Sensitive pricing calculations must run server-side.

23. Food cost is private internal information.

24. Provider delivery cost is private internal information.

25. Delivery subsidy is private internal financial information.

26. Provider secrets remain server-side.

27. Own delivery has a real business cost.

28. Third-party provider quote is not the same as a booking.

29. Provider eligibility must be validated before selection.

30. Provider selection is an internal backend decision.

31. Every selected delivery quote snapshots the target margin used.

32. Every confirmed order snapshots its financial values.

33. Historical orders must never be silently repriced.

34. Own-rider assignment is separate from provider selection.

35. V1 internal rider assignment is performed manually through Admin.

36. Third-party providers assign their own external rider/courier.

37. External provider statuses are normalized into internal statuses.

38. Delivery failures must degrade safely.

39. An order must not be accepted as a normal delivery order when no viable delivery mechanism exists.

40. Sensitive Admin setting changes must be audited.

41. Every exposed Supabase table must have appropriate RLS.

42. Authentication does not automatically imply authorization.

43. Prefer server-side authoritative calculations.

44. Prefer the simplest architecture that safely meets current requirements.

---

# 67. Final System Principle

The complete delivery philosophy of Saswati's Kitchen is:

```text
Customer chooses food
        ↓
Customer provides delivery address
        ↓
Backend reads Admin configuration
        ↓
Backend determines how delivery should happen
        ↓
Own Delivery
OR
Third-Party Delivery
        ↓
Backend determines actual delivery cost
        ↓
Backend applies current Admin-selected margin
        ↓
Backend calculates customer home-delivery charge
        ↓
Customer sees final total
        ↓
Customer places order
        ↓
Kitchen prepares order
        ↓
Own rider or external provider fulfills delivery
        ↓
Customer tracks status
        ↓
Delivered
```

The customer interacts with **Saswati's Kitchen**, not with the internal logistics-selection system.

The complexity of choosing between own riders and external delivery providers must remain hidden behind the backend.

This separation is fundamental to the architecture.
