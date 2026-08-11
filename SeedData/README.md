# Seed Data

This folder contains baseline seed data for TukDaeng backend setup.

## Asset Spec Options

Files:

- `asset-spec-options.csv` - flat seed file for database migration/import.
- `asset-spec-options.json` - grouped seed file for API mocks, fixtures, or service tests.

These options are internal FO form/filter options. They are not BO Market Data provider catalog records.

Use them for:

- Add/Edit Asset dropdowns and multi-select fields.
- Asset Detail display labels.
- Search Filter options.
- Watch Alert criteria options.

Do not use them for:

- Brand / Model / Reference catalog.
- Provider/API market data sync.
- Price index.

## Recommended Table

Recommended table name: `spec_options`

```sql
CREATE TABLE spec_options (
  id BIGSERIAL PRIMARY KEY,
  option_group TEXT NOT NULL,
  option_key TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_th TEXT NOT NULL,
  description_en TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT TRUE,
  allows_multi_select BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (option_group, option_key)
);
```

Recommended API:

```text
GET /asset-spec-options
GET /asset-spec-options?group=condition
GET /asset-spec-options?group=delivery
GET /asset-spec-options?group=case_material
GET /asset-spec-options?group=movement
GET /asset-spec-options?group=dial_color
GET /asset-spec-options?group=strap_bracelet_type
```

FO should show only `is_active = true` for new Add/Edit input.

Existing assets must keep displaying historical option labels even if an option later becomes inactive. Do not hard delete options that have been used by assets.

## Groups

| Group | FO Control | Notes |
| --- | --- | --- |
| `condition` | Single-select | Required for `Sale`; optional for `Show` / `Hide`. |
| `delivery` | Optional multi-select | Scope of Delivery. FO may show only `Original box` and `Original papers`; if neither applies, save no delivery selection. Do not create or accept other delivery options such as `Watch only`, `Warranty card`, receipt, certificate, manual, service paper, hang tag, extra link, extra strap, or travel pouch. |
| `case_material` | Single-select | Optional asset specification. |
| `movement` | Single-select | Optional asset specification. |
| `dial_color` | Single-select | Optional asset specification. |
| `strap_bracelet_type` | Single-select | Optional asset specification. |

## Versioning Rule

Keys are stable identifiers. After production use, do not rename `option_key`.

If a label needs a wording change, update only `label_en` / `label_th`.

If an option should no longer be used for new assets, set `is_active = false`.
