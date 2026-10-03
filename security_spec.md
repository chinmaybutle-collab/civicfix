# CivicFix Security Specification & Test Payloads

## 1. Data Invariants
1. A complaint report must have a valid non-empty ID matching alphanumeric/dash format (`^[a-zA-Z0-9_\\-]+$`).
2. A complaint must specify required core attributes: `id`, `title`, `category`, `status`, `priority`, `address`, and `reportedDate`.
3. Allowed status values are strictly bounded to `['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed']`.
4. Allowed priority values are strictly bounded to `['Low', 'Medium', 'High', 'Critical']`.
5. Public reads allow citizens to track complaint resolution and view civic transparency maps.
6. Updates to complaint status, assigned officer, or department require authenticated users or admin authorities.
7. Immutable fields like `id` and `reportedDate` cannot be modified during updates.

## 2. The Dirty Dozen Payloads (Designed to Fail Validation)
1. **Empty Document ID**: ID containing spaces or invalid symbols (`CIV/2026/001`).
2. **Missing Required Field**: Complaint payload without `title`.
3. **Invalid Status Transition**: Setting status to `HackedState`.
4. **Invalid Priority Level**: Setting priority to `UltraUrgent`.
5. **Oversized Title Attack**: Title exceeding 200 characters string size limit.
6. **Oversized Description Attack**: Description exceeding 2000 characters string size limit.
7. **Ghost Field Injection**: Adding unauthorized root fields like `bypassModeration: true`.
8. **Negative / NaN Coordinates**: Invalid latitude/longitude types.
9. **Tampering with ID**: Attempting to alter `id` during update.
10. **Unauthorized Admin Elevation**: Writing arbitrary document to `/admins/{uid}` without master authority.
11. **Client Timestamp Spoofing on Immutable Dates**: Modifying `reportedDate`.
12. **Malformed Ward or Department Names**: Injecting unbounded payload arrays or non-string values.
