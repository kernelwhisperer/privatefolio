# Changelog

Changes to this project will be documented in this file.
Versioning is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.1.0 - 2024/03/02

### 💡 Feature updates

- Parallelize Price API requests in `daily-prices-api` to improve performance 4-6 times.
- Add a new historical prices provider: [Redstone](https://redstone.finance/).
- Show the USD value of amounts in `TransactionDrawer` and `AuditLogDrawer`.

### 🐛 Bug Fixes

- Fix `TaskDetailsDialog` to show the previous progress percentage for updates that have the format `[undefined, string]`, indicating that the progress remained the same, but a new.

---
