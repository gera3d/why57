# A/B Testing Setup Guide — why57.com

## Architecture Overview

```
Firebase A/B Testing (Console)
  └─ assigns users to variants via Remote Config
       └─ firebase-config.js fetches assignments on page load
            └─ experiments.js applies DOM mutations per variant
                 └─ GA4 receives experiment_impression events
                      └─ experiments-dashboard.js renders results
```

---

## Step 1 — Create Firebase Project

**Your GA4 property details (already set up):**
| Field | Value |
|-------|-------|
| GA4 Property ID (numeric) | `531150669` |
| Measurement ID | `G-358H0FHG50` |
| Dashboard default | already set to `531150669` |

> ⚠️ A second GA4 property (`292639830` / `G-0800YRKXPK`) was created accidentally and receives **no traffic**. If you see it in Google Analytics, you can archive or delete it — it is safe to remove.

**Firebase project setup (already done for why57-ab):**
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `why57-ab`
3. Enable **Google Analytics** → link to GA4 property `531150669` (Measurement ID `G-358H0FHG50`)
4. Go to **Project Settings** → **Your apps** → **Add app** → Web
5. Copy the config object and paste it into `firebase-config.js` → `FIREBASE_CONFIG`

---

## Step 2 — Enable Remote Config

1. In Firebase Console → **Remote Config** → **Create configuration**
2. Click the **⋮ menu** → **Import config** → upload `experiments/rc-defaults.json`
3. Click **Publish changes**

Verify via CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use why57-ab
firebase remoteconfig:get
```

---

## Step 3 — Register GA4 Custom Dimensions

This lets the dashboard break down conversion data by experiment + variant.

1. Go to GA4 → **Admin** → **Custom definitions** → **Custom dimensions**
2. Add these two dimensions:

| Dimension name    | Scope | Event parameter   |
|-------------------|-------|-------------------|
| experiment_name   | Event | experiment_name   |
| variant_name      | Event | variant_name      |

3. Wait 24–48 hours for data to populate after dimensions are registered.

---

## Step 4 — Launch Your First Experiment

**In Firebase Console:**

1. Go to **Remote Config** → **A/B Testing** → **Create experiment**
2. Select **Remote Config** experiment type
3. Fill in:
   - **Name**: Hero Headline Framing
   - **Target**: Web app, 100% of users
   - **Metric**: (you'll track this via GA4 custom events)
4. Add variants:
   - **Baseline**: `hero_headline` = `"We build software that pays for itself."`
   - **Variant A**: `hero_headline` = `"Stop losing revenue to manual processes."`, `hero_headline_sub` = `"Every week you wait, manual work costs you more. We fix that in 4–8 weeks."`
5. Set traffic split: 50% / 50%
6. Start experiment

**Update the dashboard:**

In `experiments-dashboard.js`, find the `hero_headline` entry in `EXPERIMENT_REGISTRY` and update:
```js
status:    'running',
startDate: '2026-04-05',   // today's date
```

---

## CLI Workflow — Day-to-Day

### Check current Remote Config
```bash
firebase remoteconfig:get
```

### Download a snapshot before making changes
```bash
firebase remoteconfig:get -o experiments/rc-snapshot.json
```

### Roll out a winning variant to 100% of users
1. Edit `experiments/rc-active.json` — change the winning parameter's `defaultValue`
2. Push it:
```bash
firebase remoteconfig:set experiments/rc-active.json
```
3. Stop the experiment in Firebase Console
4. Update `status: 'completed'` in `experiments-dashboard.js`

### Roll back if something goes wrong
```bash
# List recent versions
firebase remoteconfig:versions:list

# Roll back to version 3
firebase remoteconfig:rollback --version-number 3
```

### Open Firebase Console directly
```bash
firebase open remoteconfig
```

---

## Experiment Sequence (Recommended Order)

Run one at a time. Each needs minimum 14 days.

| Order | Experiment | RC Params | Expected Impact |
|-------|-----------|-----------|----------------|
| 1 | Price Signal | `show_price_signal` | Low risk, quick signal |
| 2 | Social Proof Placement | `social_proof_above_fold` | Medium risk |
| 3 | Hero Headline Framing | `hero_headline` | High impact |
| 4 | CTA Copy | `hero_cta_primary`, `nav_cta` | High impact |
| 5 | 57Seconds Hero | `hero_lead_service` | High risk / high reward |
| 6 | Intake Position | `intake_above_fold` | Last — biggest change |

---

## Reading Results in the Dashboard

1. Open `dashboard.html` → click **Experiments** tab
2. Switch a card from `draft` → `running` in `experiments-dashboard.js` to see live stats
3. Cards show:
   - **Lift %** = how much better/worse the variant performs vs control
   - **p-value** = probability the result is random (< 0.05 = statistically significant)
   - **Confidence bar** = visual representation of statistical confidence
   - **Verdict** = Winner / Losing / Inconclusive / No data yet

## Statistical Significance

The dashboard uses a two-proportion z-test (same method as Firebase):
- **p < 0.05** → result is statistically significant (95% confidence)
- **Lift > 0 + significant** → Variant wins → roll out
- **Lift < 0 + significant** → Variant loses → stop and revert
- **Inconclusive** → keep running until you hit significance or 30 days

---

## BigQuery (Optional — Phase 2)

For deeper analysis (device breakdown, traffic source, new vs returning):

1. In Firebase Console → **Project Settings** → **Integrations** → **BigQuery** → Link
2. GA4 events export automatically to `analytics_XXXXXXX.events_*` tables
3. Use this query to get variant conversion rates:

```sql
WITH enrolled AS (
  SELECT
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(user_properties)
     WHERE key = 'firebase_exp_YOUR_EXP_ID') AS variant
  FROM `your-project.analytics_XXXXXXX.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260401' AND '20260430'
    AND (SELECT value.string_value FROM UNNEST(user_properties)
         WHERE key = 'firebase_exp_YOUR_EXP_ID') IS NOT NULL
),
converted AS (
  SELECT DISTINCT user_pseudo_id
  FROM `your-project.analytics_XXXXXXX.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260401' AND '20260430'
    AND event_name = 'intake_completed'
)
SELECT
  e.variant,
  COUNT(DISTINCT e.user_pseudo_id) AS users,
  COUNT(DISTINCT c.user_pseudo_id) AS converted,
  ROUND(100.0 * COUNT(DISTINCT c.user_pseudo_id) / COUNT(DISTINCT e.user_pseudo_id), 2) AS cvr_pct
FROM enrolled e
LEFT JOIN converted c USING (user_pseudo_id)
GROUP BY variant
ORDER BY variant;
```

Replace `YOUR_EXP_ID` with the numeric experiment ID from the Firebase Console URL.
