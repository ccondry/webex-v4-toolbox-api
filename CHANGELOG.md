# go-cms-api Change Log

Version numbers are semver-compatible dates in YYYY.MM.DD-X format,
where X is the revision number


# 2020.10.23-3

### Bug Fixes
* **User Expiration:** When user is being manually extended or expired, add or
remove them from the Active LDAP group


# 2020.10.23-2

### Bug Fixes
* **User Expiration:** Fix extending user expiration and adding them to the
Active group.


# 2020.10.23-1

### Features
* **User Expiration:** Run a scheduled job every hour (or configurable amount)
to remove expired users from the configured Active group in LDAP.
* **User:** Combined admin and user account routes all into /user route


# 2020.10.23

### Features
* **Created:** Created site and changelog