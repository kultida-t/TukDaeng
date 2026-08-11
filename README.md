# TukDaeng Documentation Workspace

Repository นี้จัดเอกสารตามขอบเขตงาน เพื่อให้ Product, UX, Dev และ QA หา source of truth ได้ชัดเจน

Shared FO/BO integration map:

- [ProjectAdmin/FO_BO_INTEGRATION_MAP.md](ProjectAdmin/FO_BO_INTEGRATION_MAP.md)

## Start Here

สำหรับงาน Front Office ให้เริ่มอ่าน:

1. [FrontOffice/DOCUMENT_VERSION.md](FrontOffice/DOCUMENT_VERSION.md)
2. [FrontOffice/README_MODULE_INDEX.md](FrontOffice/README_MODULE_INDEX.md)
3. [FrontOffice/TukDaeng_Master_Product_Definition.md](FrontOffice/TukDaeng_Master_Product_Definition.md)

Current Front Office baseline: `FO-PRD-v1.2`

สำหรับงาน Back Office ให้เริ่มอ่าน:

1. [BackOffice/DOCUMENT_VERSION.md](BackOffice/DOCUMENT_VERSION.md)
2. [BackOffice/README_MODULE_INDEX.md](BackOffice/README_MODULE_INDEX.md)
3. [BackOffice/BO_MASTER_BASELINE.md](BackOffice/BO_MASTER_BASELINE.md)

Current Back Office baseline: `BO-PRD-v0.1`

## Folder Map

| Folder | Purpose |
| --- | --- |
| [FrontOffice](FrontOffice) | เอกสาร PRD, module specs, Dev/QA/Figma handoff ของ Front Office |
| [BackOffice](BackOffice) | BO baseline, legacy specs, module index และ implementation checklist |
| [DailyLogs](DailyLogs) | Daily work reports |
| [SourceInputs](SourceInputs) | เอกสาร input ต้นทางที่ใช้เป็น reference |
| [ProjectAdmin](ProjectAdmin) | เอกสารกลางของโปรเจค policy, workflow, integration map และ admin references |
| [Prototypes](Prototypes) | HTML/JS preview artifacts และ local prototype server files |

## Front Office Key Files

| Need | File |
| --- | --- |
| Baseline version และ version history | [FrontOffice/DOCUMENT_VERSION.md](FrontOffice/DOCUMENT_VERSION.md) |
| Reading order และ module map | [FrontOffice/README_MODULE_INDEX.md](FrontOffice/README_MODULE_INDEX.md) |
| Product source of truth | [FrontOffice/TukDaeng_Master_Product_Definition.md](FrontOffice/TukDaeng_Master_Product_Definition.md) |
| Dev baseline package | [FrontOffice/DEV_BASELINE_HANDOFF_2026-06-22.md](FrontOffice/DEV_BASELINE_HANDOFF_2026-06-22.md) |
| Dev implementation checklist | [FrontOffice/DEV_IMPLEMENTATION_CHECKLIST.md](FrontOffice/DEV_IMPLEMENTATION_CHECKLIST.md) |
| Chat-specific Dev checklist | [FrontOffice/DEV_CHAT_IMPLEMENTATION_CHECKLIST.md](FrontOffice/DEV_CHAT_IMPLEMENTATION_CHECKLIST.md) |
| QA regression checklist | [FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md](FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md) |
| Figma gap checklist | [FrontOffice/Figma_Gap_Checklist_Against_Master.md](FrontOffice/Figma_Gap_Checklist_Against_Master.md) |
| Figma cleanup task breakdown | [FrontOffice/FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md](FrontOffice/FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md) |

## Back Office Key Files

| Need | File |
| --- | --- |
| Baseline version และ source-of-truth order | [BackOffice/DOCUMENT_VERSION.md](BackOffice/DOCUMENT_VERSION.md) |
| Reading order และ module map | [BackOffice/README_MODULE_INDEX.md](BackOffice/README_MODULE_INDEX.md) |
| Product baseline และ sprint scope | [BackOffice/BO_MASTER_BASELINE.md](BackOffice/BO_MASTER_BASELINE.md) |
| Global BO rules และ responsive behavior | [BackOffice/00_GLOBAL_RULES_MODULE.md](BackOffice/00_GLOBAL_RULES_MODULE.md) |
| BO authentication และ admin accounts | [BackOffice/01_AUTHENTICATION_MODULE.md](BackOffice/01_AUTHENTICATION_MODULE.md) |
| BO dashboard overview และ pending queues | [BackOffice/02_DASHBOARD_MODULE.md](BackOffice/02_DASHBOARD_MODULE.md) |
| BO user management | [BackOffice/03_USER_MANAGEMENT_MODULE.md](BackOffice/03_USER_MANAGEMENT_MODULE.md) |
| BO asset management | [BackOffice/04_ASSET_MANAGEMENT_MODULE.md](BackOffice/04_ASSET_MANAGEMENT_MODULE.md) |
| BO content / board management | [BackOffice/05_CONTENT_BOARD_MODULE.md](BackOffice/05_CONTENT_BOARD_MODULE.md) |
| BO market data management | [BackOffice/06_MARKET_DATA_MODULE.md](BackOffice/06_MARKET_DATA_MODULE.md) |
| BO directory management | [BackOffice/07_DIRECTORY_MODULE.md](BackOffice/07_DIRECTORY_MODULE.md) (future/postponed; not Phase 1) |
| BO audit log | [BackOffice/08_AUDIT_LOG_MODULE.md](BackOffice/08_AUDIT_LOG_MODULE.md) |
| BO offer / chat management | [BackOffice/09_OFFER_CHAT_MODULE.md](BackOffice/09_OFFER_CHAT_MODULE.md) |
| BO social interaction management | [BackOffice/10_SOCIAL_INTERACTION_MODULE.md](BackOffice/10_SOCIAL_INTERACTION_MODULE.md) |
| BO watch alert management | [BackOffice/11_WATCH_ALERT_MODULE.md](BackOffice/11_WATCH_ALERT_MODULE.md) |
| BO help / support management | [BackOffice/12_HELP_SUPPORT_MODULE.md](BackOffice/12_HELP_SUPPORT_MODULE.md) |
| BO account deletion requests | [BackOffice/13_ACCOUNT_DELETION_MODULE.md](BackOffice/13_ACCOUNT_DELETION_MODULE.md) |
| BO notifications | [BackOffice/14_NOTIFICATIONS_MODULE.md](BackOffice/14_NOTIFICATIONS_MODULE.md) |
| BO reports / analytics | [BackOffice/15_REPORTS_ANALYTICS_MODULE.md](BackOffice/15_REPORTS_ANALYTICS_MODULE.md) |
| BO admin settings | [BackOffice/16_ADMIN_SETTINGS_MODULE.md](BackOffice/16_ADMIN_SETTINGS_MODULE.md) |
| BO final review / dev handoff | [BackOffice/BO_FINAL_REVIEW_AND_HANDOFF.md](BackOffice/BO_FINAL_REVIEW_AND_HANDOFF.md) |
| Dev implementation checklist | [BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md](BackOffice/BO_DEV_IMPLEMENTATION_CHECKLIST.md) |
| BO clickable prototype | [Prototypes/bo-prototype.html](Prototypes/bo-prototype.html) |
| Existing BO PRD source | [BackOffice/BO_PRD.md](BackOffice/BO_PRD.md) |
| Existing BO spec source | [BackOffice/BO_Spec.md](BackOffice/BO_Spec.md) |
| Existing BO completion addendum | [BackOffice/BO_Spec_Completion_Addendum.md](BackOffice/BO_Spec_Completion_Addendum.md) |

## Shared Project Files

| Need | File |
| --- | --- |
| FO/BO cross-system trigger และ action mapping | [ProjectAdmin/FO_BO_INTEGRATION_MAP.md](ProjectAdmin/FO_BO_INTEGRATION_MAP.md) |

## Notes

- ถ้า Front Office document ขัดกับ Figma หรือเอกสารเก่า ให้ใช้ source-of-truth order ใน [FrontOffice/README_MODULE_INDEX.md](FrontOffice/README_MODULE_INDEX.md)
- ถ้า Back Office document ขัดกับ legacy BO specs ให้ใช้ source-of-truth order ใน [BackOffice/DOCUMENT_VERSION.md](BackOffice/DOCUMENT_VERSION.md)
- Requirement ที่ข้าม Front Office และ Back Office ให้ใช้ [ProjectAdmin/FO_BO_INTEGRATION_MAP.md](ProjectAdmin/FO_BO_INTEGRATION_MAP.md) เพื่อ trace ทั้งสองฝั่งโดยไม่ปน scope
- Source input `.docx` เก็บไว้ใน [SourceInputs](SourceInputs) เพื่อ trace requirement กลับไปยังต้นทาง
- Daily logs เป็นประวัติงาน ไม่ใช่ source of truth
- edit test
