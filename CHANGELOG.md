# webex-v4-toolbox-api Change Log

Version numbers are semver-compatible dates in YYYY.MM.DD-X format,
where X is the revision number


# 2021.2.25-1

### Bug Fixes
* **Provision:** Fix bugs in password decryption during VPN LDAP user creation.


# 2021.2.25

### Bug Fixes
* **Provision:** Fix new bugs in database REST commands and VPN LDAP user creation.


# 2021.2.24

### Features
* **Provision:** Move database commands to REST commands with JWT to
toolbox-login-api. decrypt user password during provision and use it provision
VPN LDAP account, removing the password from the database at the end of
successful provision.


# 2021.2.23-2

### Bug Fixes
* **Provision:** Fix logic of adding user team to global voice queue call
distribution group 1.


# 2021.2.23-1

### Features
* **Provision:** Don't set cstts__l on CJP objects during provision.


# 2021.2.23

### Features
* **Globals:** Refresh globals every 1 minute instead of every 5 minutes.
* **Provision:** Use CJP template user data instead of static template data to
modify users.

### Bug Fixes
* **Provision:** Get all broadcom phone numbers and extensions, not just the
first 200. Set CJP users to Contact Center Enabled.


# 2021.2.20

### Bug Fixes
* **Provision:** Multiple bug fixes and improvements.
* **Deprovision:** Multiple bug fixes and improvements.


# 2021.2.19-2

### Features
* **Deprovision:** Remove team from global voice queue distribution group during deprovision.
* **Provision:** Check if team is in the global voice queue distribution group before adding it.


# 2021.2.19-1

### Features
* **Provision:** Don't delete LDAP users during deprovision.


# 2021.2.19

### Bug Fixes
* **Provision:** Fix chat and email provisioning with new provision code for
routing strategies, chat entry point, chat queue, and email queue.


# 2021.2.18

### Features
* **Provision:** Improve provision and deprovision.
### Bug Fixes
* **Provision:** Fix provisions issues from copied code.


# 2021.2.17-2

### Features
* **Provision:** Provision and deprovision LDAP accounts directly (moving this
software from the Toolbox server to Branding server inside the dCloud session).


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