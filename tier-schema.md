# Tier Allocation Schema — Where To Next

This file is the single source of truth for how a destination's four axis scores map to a letter tier (S–E). Any script or agent computing tiers should match this exactly. If the weights or thresholds ever change, update this file **and** the corresponding code in the same commit — don't let them drift apart.

## Axes

Every scored destination has four values, each 1–10:

- `cost_value` — value for money, not just cheapness
- `uniqueness` — how distinct/irreplaceable the experience is vs. substitutable elsewhere
- `transit_ease` — how easy the destination is to reach and get around once there
- `family_friendliness` — suitability for a general/family traveler

## Weights

`cost_value` and `uniqueness` are weighted 1.5x; `transit_ease` and `family_friendliness` stay at 1x. This is an intentional choice for a bucket-list/adventure tier list — being hard to reach or less family-friendly shouldn't sink an otherwise irreplaceable, well-priced destination as much as being generic or bad value should.

| Axis | Weight |
|---|---|
| cost_value | 1.5 |
| uniqueness | 1.5 |
| transit_ease | 1.0 |
| family_friendliness | 1.0 |
| **Total weight** | **5.0** |

## Formula

```
weighted_score = (cost_value * 1.5 + uniqueness * 1.5 + transit_ease * 1.0 + family_friendliness * 1.0) / 5.0
```

## Thresholds → Tier

| Weighted score | Tier |
|---|---|
| ≥ 8.5 | S |
| 7.5 – 8.49 | A |
| 6.5 – 7.49 | B |
| 5.5 – 6.49 | C |
| 4.5 – 5.49 | D |
| < 4.5 | E |

## Worked example

Costa Rica: `cost_value: 7, uniqueness: 9, transit_ease: 8, family_friendliness: 9`

```
weighted_score = (7*1.5 + 9*1.5 + 8*1.0 + 9*1.0) / 5.0
               = (10.5 + 13.5 + 8 + 9) / 5.0
               = 41 / 5.0
               = 8.2  →  Tier A
```

## Machine-readable copy

For any script/agent that wants to consume this directly instead of hardcoding the numbers twice:

```json
{
  "weights": {
    "cost_value": 1.5,
    "uniqueness": 1.5,
    "transit_ease": 1.0,
    "family_friendliness": 1.0
  },
  "total_weight": 5.0,
  "thresholds": [
    { "min": 8.5, "tier": "S" },
    { "min": 7.5, "tier": "A" },
    { "min": 6.5, "tier": "B" },
    { "min": 5.5, "tier": "C" },
    { "min": 4.5, "tier": "D" },
    { "min": 0,   "tier": "E" }
  ]
}
```

## Rule for future destinations

Once a destination's `score` block is filled in, its `tier` should be **computed automatically** from this formula — not hand-assigned. Leave `tier: null` in the frontmatter for any new destination; the build pipeline fills it in from `score` at parse time. A destination with no `score` yet stays untiered and excluded from `/tiers`, same as today.
