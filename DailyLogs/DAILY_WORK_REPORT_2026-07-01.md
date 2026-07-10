# Daily Work Report: Tuk Daeng

## Work Date - 2026-07-01

### Focus today

ล็อก UX / product rules ต่อจาก Asset Management และ Asset Detail โดยเน้นจุดที่ Dev ต้องใช้ทำ Figma และ implementation: quick actions, change status, add asset confirmation, social metadata, empty comments และ feed owner actions

### Main working areas

- Owner Profile asset card quick actions: กำหนดปุ่ม `...` บนรูป asset card เฉพาะ Owner view และแยกเมนูตาม status
- Feed own-post actions: เพิ่มชุดเมนูสำหรับ asset ของตัวเองบน Feed ให้มี `Edit asset`, `Edit provenance`, `Mark as sold`, `Change status`, `Delete asset`
- Change Status flow: กำหนด bottom sheet, options, loading, success/error copy และ behavior หลังเปลี่ยนสถานะสำเร็จ
- Consignment status conversion: หาก Consignment เปลี่ยนจาก Sale เป็น Show/Hide ต้อง warning และบังคับกลับเป็น Owner provenance พร้อม require Purchase Price
- Add Asset confirmation: กำหนด modal `Add this asset?`, primary action `Add asset`, loading `Adding...`, success `Asset added.` และ failure handling
- Asset Detail engagement row: แยก top heart เป็น Like/Unlike action และ metadata heart ใต้ชื่อ asset เป็น like count / Liked by entry
- Comment empty state: กำหนด `No comments yet.`, `Be the first to comment.`, และ input placeholder `Write a comment...`
- Count display: หาก like/comment count = 0 สามารถแสดง icon อย่างเดียวโดยไม่แสดงเลข 0 ได้

### Documents updated

- `FrontOffice/02_FEED_MODULE.md`
- `FrontOffice/04_ASSET_MANAGEMENT_MODULE.md`
- `FrontOffice/05_ASSET_DETAIL_MODULE.md`
- `FrontOffice/06_PROFILE_MODULE.md`
- `FrontOffice/QA_TEST_SCENARIO_CHECKLIST.md`
- `FrontOffice/TukDaeng_Master_Product_Definition.md`

### Commit pushed during the day

- `f7e4637 docs: update asset quick actions and detail states`

### Additional files being committed after cleanup

- `FrontOffice/FIGMA_UX_CLEANUP_TASK_BREAKDOWN.md`
- `DailyLogs/DAILY_WORK_REPORT_2026-06-29.md`
- `DailyLogs/DAILY_WORK_REPORT_2026-07-01.md`

### Current implementation notes for Dev

- `Sold` assets must not show Delete/Edit/Change Status in normal Owner quick actions
- `Mark as sold` is separate from Change Status and must go through Sale History
- Feed only shows Sale assets, so Change Status from Feed can only move own Sale asset out of Feed
- `Show` and `Hide` quick actions use Owner purchase history, not Consignment
- Top heart and engagement-row heart are separate controls and must not share the same tap behavior

### Next step

Continue Figma cleanup and verify the updated specs are reflected in prototype screens for Owner Profile card menu, Feed own-post menu, Add Asset confirmation, Change Status sheet, and Asset Detail comments/engagement row.
