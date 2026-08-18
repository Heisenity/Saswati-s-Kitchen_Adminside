# Saswati's Kitchen — Database Design

## 1. Purpose

This document defines the initial PostgreSQL database model for the Saswati's Kitchen platform.

Supabase PostgreSQL is the primary database.

The database serves:

- Admin Web Portal
- Customer Mobile App
- Rider Mobile App
- Delivery Engine
- Third-party delivery integrations
- Future analytics

---

# 2. General Conventions

## IDs

Use UUID primary keys unless there is a strong reason not to.

Example:

```sql
id uuid primary key default gen_random_uuid()
```

---

## Timestamps

Use timezone-aware timestamps.

Preferred:

```sql
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

---

## Monetary Values

Authoritative monetary values should be stored as integer paise.

Example:

```text
₹159.00
=
15900 paise
```

Recommended field convention:

```text
selling_price_paise
food_cost_paise
delivery_cost_paise
subtotal_paise
total_paise
```

This avoids floating-point errors.

Conversion to formatted INR happens at the application boundary.

---

## Margins / Rates

Margin should be stored as a decimal ratio.

Example:

```text
0.25 = 25%
0.28 = 28%
0.30 = 30%
```

Recommended PostgreSQL type:

```sql
numeric(6,5)
```

A margin must satisfy:

```text
0 < margin < 1
```

Do not hardcode 25%.

---

# 3. Core Entity Groups

```text
AUTH / ADMIN
admin_users

CATALOG
categories
menu_items

CUSTOMERS
customers
customer_addresses

ORDERS
orders
order_items
order_status_history

RIDERS
riders
rider_availability
rider_locations

DELIVERY
delivery_settings
delivery_providers
delivery_quotes
deliveries
delivery_events

PAYMENTS
payments

AUDIT
audit_logs
```

---

# 4. `admin_users`

Purpose:

Controls access to the Admin Web Portal.

Suggested columns:

```text
id
auth_user_id
display_name
role
is_active
created_at
updated_at
```

`auth_user_id` references:

```text
auth.users.id
```

Possible roles:

```text
SUPER_ADMIN
OWNER
ADMIN
KITCHEN_MANAGER
ORDER_MANAGER
DELIVERY_MANAGER
```

Authorization must not rely on user-editable metadata.

---

# 5. `categories`

Purpose:

Groups menu items.

Suggested columns:

```text
id
name_en
name_bn
slug
description
image_url
sort_order
is_active
created_at
updated_at
```

Example categories:

```text
Thalis
Combos
Add-ons
Desserts
Beverages
```

---

# 6. `menu_items`

Purpose:

Canonical menu item data.

Suggested columns:

```text
id
category_id

name_en
name_bn

description_en
description_bn

selling_price_paise
food_cost_paise

image_url

meal_period

is_vegetarian
is_active
is_available

daily_stock

is_featured
is_bestseller

sort_order

created_at
updated_at
```

Possible `meal_period` values:

```text
LUNCH
DINNER
BOTH
```

Important:

`food_cost_paise` is private business information.

Customer-facing access must not expose food cost.

---

# 7. `customers`

Purpose:

Customer profile.

Suggested columns:

```text
id
auth_user_id
name
phone
email
is_active
created_at
updated_at
```

Depending on authentication strategy, `auth_user_id` may initially be nullable.

---

# 8. `customer_addresses`

Suggested columns:

```text
id
customer_id

label

recipient_name
phone

address_line_1
address_line_2
landmark
city
state
postal_code

latitude
longitude

is_default

created_at
updated_at
```

Examples for `label`:

```text
HOME
WORK
OTHER
```

---

# 9. `orders`

Purpose:

Canonical order header.

Suggested columns:

```text
id
order_number

customer_id

status

food_subtotal_paise
customer_delivery_charge_paise
discount_paise
total_paise

food_cost_snapshot_paise
delivery_cost_snapshot_paise
delivery_subsidy_paise

target_margin_used

delivery_mode
delivery_provider

delivery_quote_id

payment_status
payment_method

delivery_address_snapshot jsonb

customer_notes

confirmed_at
cancelled_at
delivered_at

created_at
updated_at
```

Important:

Financial values are snapshotted.

Historical orders must not depend on current menu prices or current delivery settings.

---

# 10. `order_items`

Suggested columns:

```text
id
order_id
menu_item_id

item_name_snapshot
unit_price_paise
unit_food_cost_paise

quantity

line_total_paise
line_food_cost_paise

created_at
```

Why snapshots?

If Chicken Thali changes:

```text
₹159 → ₹169
```

an old order must still show the original ₹159 price.

---

# 11. `order_status_history`

Suggested columns:

```text
id
order_id

from_status
to_status

changed_by_type
changed_by_id

notes

created_at
```

Possible `changed_by_type`:

```text
ADMIN
CUSTOMER
RIDER
SYSTEM
PROVIDER
```

---

# 12. Order Status Enum

Canonical statuses:

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

Do not store arbitrary text statuses.

---

# 13. `riders`

Suggested columns:

```text
id
auth_user_id

name
phone

vehicle_type
vehicle_number

is_active

created_at
updated_at
```

Initial vehicle type:

```text
TWO_WHEELER
```

Future values may include others.

---

# 14. `rider_availability`

Purpose:

Current operational state.

Suggested columns:

```text
rider_id

status

current_order_id

last_status_change_at
updated_at
```

Possible status values:

```text
OFFLINE
AVAILABLE
BUSY
PAUSED
```

---

# 15. `rider_locations`

Purpose:

Stores rider location updates where required.

Suggested columns:

```text
id
rider_id

latitude
longitude

accuracy_meters

recorded_at
```

Do not store unlimited high-frequency historical location data indefinitely without a retention strategy.

---

# 16. `delivery_settings`

Purpose:

Global delivery business configuration.

There should generally be one active global configuration for V1.

Suggested columns:

```text
id

target_margin

delivery_mode

own_delivery_enabled
fallback_enabled

rounding_increment_paise

minimum_order_value_paise

quote_variance_limit_paise

updated_by
updated_at
```

Possible `delivery_mode` values:

```text
AUTOMATIC
OWN_ONLY
THIRD_PARTY_ONLY
```

Important:

`target_margin` is dynamic.

Example:

```text
0.28
```

means:

```text
28%
```

No delivery calculation may assume 25%.

---

# 17. `delivery_providers`

Purpose:

Stores enabled/disabled provider configuration.

Suggested columns:

```text
id

provider_code
display_name

provider_type

is_enabled

priority

metadata jsonb

created_at
updated_at
```

Suggested provider codes:

```text
INTERNAL
PORTER
UBER_DIRECT
RAPIDO
```

Possible provider types:

```text
OWN
THIRD_PARTY
```

Provider credentials must not be stored as public-readable database fields.

Use secure server-side secrets.

---

# 18. `delivery_quotes`

Purpose:

Stores all delivery quotes considered for an order.

Suggested columns:

```text
id

order_id
checkout_session_id

provider_code
provider_quote_id

provider_cost_paise
customer_delivery_charge_paise
delivery_subsidy_paise

food_subtotal_paise
food_cost_paise

target_margin_used

eta_minutes

estimated_pickup_at
estimated_dropoff_at

status

is_selected

expires_at

raw_response jsonb

created_at
```

Possible status:

```text
VALID
EXPIRED
REJECTED
SELECTED
BOOKED
FAILED
```

Important:

Always persist:

```text
provider_cost
customer contribution
target margin used
```

for selected quotes.

---

# 19. `deliveries`

Purpose:

Represents the actual delivery booking.

Suggested columns:

```text
id
order_id

delivery_quote_id

delivery_mode
provider_code

internal_rider_id
provider_delivery_id

status

provider_cost_paise
customer_delivery_charge_paise
delivery_subsidy_paise

rider_payout_paise

pickup_at
delivered_at
cancelled_at

created_at
updated_at
```

---

# 20. Delivery Status Enum

Canonical values:

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

External provider statuses must be converted into these statuses.

---

# 21. `delivery_events`

Purpose:

Immutable delivery event history.

Suggested columns:

```text
id
delivery_id

provider_code

event_type

provider_status
normalized_status

payload jsonb

occurred_at
created_at
```

Useful for:

```text
webhooks
debugging
tracking
audit
provider reconciliation
```

---

# 22. `payments`

Suggested columns:

```text
id
order_id

provider

payment_method
payment_status

amount_paise

provider_payment_id

paid_at
failed_at

metadata jsonb

created_at
updated_at
```

Possible payment methods:

```text
COD
UPI_ON_DELIVERY
ONLINE
```

Possible statuses:

```text
PENDING
PAID
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 23. `audit_logs`

Purpose:

Records sensitive Admin activity.

Suggested columns:

```text
id

actor_admin_user_id

action
resource_type
resource_id

old_value jsonb
new_value jsonb

ip_address
user_agent

created_at
```

Examples:

```text
UPDATE_MARGIN
UPDATE_MENU_PRICE
UPDATE_FOOD_COST
CHANGE_DELIVERY_MODE
ENABLE_PROVIDER
DISABLE_PROVIDER
ASSIGN_RIDER
CANCEL_ORDER
```

---

# 24. Critical Relationships

```text
categories
    │
    └── menu_items

customers
    │
    ├── customer_addresses
    │
    └── orders
          │
          ├── order_items
          ├── order_status_history
          ├── delivery_quotes
          ├── deliveries
          └── payments

riders
    │
    ├── rider_availability
    └── rider_locations

deliveries
    │
    └── delivery_events
```

---

# 25. Suggested Indexes

At minimum consider indexes for:

```text
menu_items(category_id)
menu_items(is_active, is_available)

orders(customer_id)
orders(status)
orders(created_at)
orders(order_number)

order_items(order_id)

order_status_history(order_id, created_at)

rider_availability(status)

delivery_quotes(order_id)
delivery_quotes(checkout_session_id)
delivery_quotes(provider_code)
delivery_quotes(expires_at)

deliveries(order_id)
deliveries(status)
deliveries(provider_code)

delivery_events(delivery_id, occurred_at)

payments(order_id)
payments(payment_status)

audit_logs(actor_admin_user_id)
audit_logs(resource_type, resource_id)
audit_logs(created_at)
```

---

# 26. Row Level Security

RLS must be enabled on exposed application tables.

General model:

## Admin

Authorized Admin roles may access operational/business records according to role permissions.

## Customer

Customers may only:

```text
read customer-visible menu data
read/update their own profile
read/update their own addresses
read their own orders
read their own delivery status
```

Customers must never access:

```text
food costs
provider costs
internal margins
rider payouts
audit logs
other customers' orders
```

## Rider

Riders may only:

```text
read their own rider profile
update permitted availability information
read assigned deliveries
update permitted delivery workflow state
```

A rider must not have unrestricted order/database access.

---

# 27. Admin Authorization

Do not assume:

```text
authenticated user = admin
```

Authentication and authorization are separate concepts.

An authenticated account must have a valid active record in `admin_users` with an allowed role before receiving Admin privileges.

---

# 28. Security Requirements

Never expose:

```text
Supabase service-role key
third-party delivery provider secrets
payment gateway secrets
private database credentials
```

to:

```text
browser JavaScript
Customer APK
Rider APK
```

---

# 29. Database Mutation Rules

Business-critical mutations should be executed through controlled server-side code where appropriate.

Examples:

```text
Create order
Calculate delivery quote
Select provider
Confirm delivery
Process provider webhook
Payment verification
```

Simple authorized CRUD may use Supabase directly.

---

# 30. Order Financial Snapshot Rule

Once an order is confirmed, store:

```text
selling price used
food cost used
food subtotal
provider delivery cost
customer delivery charge
delivery subsidy
target margin used
total
```

Changing Admin settings later must not alter this historical snapshot.

---

# 31. Soft Deletion

Prefer:

```text
is_active = false
```

for business entities such as menu items and riders where historical references exist.

Do not physically delete records that are referenced by historical orders unless there is a specific retention/deletion requirement.

---

# 32. Realtime Tables

Initial candidates:

```text
orders
rider_availability
deliveries
```

Enable realtime only where the UX requires it.

---

# 33. Migration Rules

All schema changes must be represented through migrations.

Do not manually change production schema without recording the change.

Migration names should be descriptive.

Examples:

```text
create_admin_users
create_catalog
create_order_tables
create_rider_tables
create_delivery_tables
add_delivery_margin_snapshot
```

---

# 34. V1 Database Priorities

Implement in this order:

```text
1. admin_users
2. categories
3. menu_items
4. delivery_settings
5. delivery_providers
6. customers
7. customer_addresses
8. orders
9. order_items
10. order_status_history
11. riders
12. rider_availability
13. delivery_quotes
14. deliveries
15. delivery_events
16. payments
17. audit_logs
```

---

# 35. Database Non-Negotiables

- No hardcoded margin.
- No floating-point money calculations.
- Historical order values must be snapshotted.
- Food cost is private.
- Provider cost is private.
- RLS is mandatory on exposed tables.
- Provider secrets never live in public-readable columns.
- Admin status must be verified from trusted data.
- External delivery statuses must not become arbitrary internal statuses.
- Financial calculations must be reproducible from stored snapshots.