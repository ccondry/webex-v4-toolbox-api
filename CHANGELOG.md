# webex-v4-toolbox-api Change Log

Version numbers are semver-compatible dates in YYYY.MM.DD-X format,
where X is the revision number


# 2021.5.6-2

### Fixes
* **Provision:** Fix WXM provision.


# 2021.5.6-1

### Fixes
* **Provision:** Fix WXM provision request method.


# 2021.5.6

### Features
* **Provision:** Add WXM user mapping to provision steps.


# 2021.4.7-1

### Bug Fixes
* **Provision:** Log to Webex for every 50 retries when waiting for Sandra and
Rick users to sync from LDAP to Webex Control Hub.


# 2021.3.31-1

### Bug Fixes
* **Provision:** Fix some issues with the new Control Hub chat template
provisioning.


# 2021.3.31

### Features
* **Provision:** Provision Control Hub chat templates using template data on
Control Hub instead of static template data.


# 2021.3.19

### Features
* **Logging:** Remove all invalid characters from new LDAP SAMAccount names.


# 2021.3.18-1

### Features
* **Logging:** Add more temporary network errors to not log to the Webex logs
room.


# 2021.3.18

### Features
* **Logging:** Don't send temporary network error logs to the Webex logs room.


# 2021.3.17-5

### Bug Fixes 
* **Deprovision:** Remove any previous provision password and error from user
demo config data when provision completes succesfully.
* **Provision:** Remove any previous provision password and error from user
demo config data when provision completes succesfully.


# 2021.3.17-4

### Bug Fixes 
* **Service:** Fix issue causing service to not start.


# 2021.3.17-3

### Features 
* **Logs:** Update the startup log messages to always include the location.


# 2021.3.17-2

### Bug Fixes
* **Deprovision:** Fix marking users for deprovision when there are too many
users currently provisioned.
* **Provision:** Fix user provision error message.


# 2021.3.17-1

### Features
* **Webex Logs:** Add location information to webex logs.


# 2021.3.17

### Features
* **Provision:** If a new user chooses a password that does not meet the LDAP
requirements, stop trying to provision them and provide the error to the UI.


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