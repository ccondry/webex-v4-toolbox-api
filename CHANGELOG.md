# webex-v4-toolbox-api Change Log

Version numbers are semver-compatible dates in YYYY.MM.DD-X format,
where X is the revision number


# 2021.2.17-1

### Features
* **Provision:** Automatically deprovision oldest users over the max users
number (ordered by last access time).


# 2021.2.17

### Features
* **Provision:** Complete provision changes for Webex Calling, licenses, roles.


# 2021.2.12

### Features
* **Token:** Move token management code to separate project.


# 2021.2.11-3

### Bug Fixes
* **Token:** Fix updating refresh token value in database.


# 2021.2.11-2

### Bug Fixes
* **Provision:** Fix global email routing strategy provisioning again.


# 2021.2.11-1

### Bug Fixes
* **Provision:** Fix global email routing strategy provisioning. Fix queue
provisioning again. Wait for user team to exist after creating it.


# 2021.2.11

### Bug Fixes
* **Provision:** Add user team back to provision. Remove chat and email routing
strategy from user provision, instead using the queue's distribution group 
property to route to the user's agent.


# 2021.2.10-1

### Bug Fixes
* **Provision:** Fix many bugs in new provision script.


# 2021.2.10

### Features
* **Provision:** Update provision script for skill-based voice routing.


# 2020.11.20

### Features
* **Provision:** Completed all steps in the provision process, changed job queue
to a database query on an interval.


# 2020.11.19

### Features
* **Provision:** Built provision code and connected to provision route


# 2020.11.18

### Features
* **Created:** Created