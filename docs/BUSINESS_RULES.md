# Saswati's Kitchen — Business Rules

# 44. Admin Safety Rule


If Admin attempts to disable every delivery method:


```text
Own delivery OFF
Porter OFF
Uber OFF
Rapido OFF
```


show a warning that customer delivery ordering will become unavailable.


Require explicit confirmation.


---


# 45. Historical Integrity Rule


Never recalculate old orders using:


```text
current menu prices
current food costs
current margin
current provider settings
```


Historical reporting uses stored snapshots.


---


# 46. V1 Business Priorities


V1 priority order:


```text
1. Accurate menu control
2. Accurate order workflow
3. Reliable own-rider delivery
4. Dynamic margin pricing
5. Rider management
6. Realtime operational status
7. Delivery reporting
8. Third-party fallback integrations
```


---


# 47. Non-Negotiable Business Rules


- Margin is dynamic.
- 25% is not hardcoded.
- Customer pricing is backend-authoritative.
- Food cost remains private.
- Historical orders preserve their financial snapshots.
- Cheapest provider must still be eligible.
- Expired quotes cannot be booked.
- Customer App never talks directly to providers.
- Provider failures must degrade gracefully.
- Customer should never unknowingly absorb provider API complexity.
- Admin changes affecting money must be auditable.
