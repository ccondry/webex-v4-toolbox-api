# webex-v4-toolbox-api
This is the REST API service for the dCloud Webex Contact Center v4 instant demo web portal.

## Development
### Install Dependencies
`yarn` to download node dependencies. 
Do this once the first time you clone this project.

### Start/Stop
`yarn start` to start the application in development mode

## Production

### Installation
`./install.sh` to install onto proudction server. installs dependencies, creates
.env file, and installs systemd service in Linux.

You will need to have a valid refresh token from https://admin.webex.com for
the Control Hub services to work. Use your browser's developer tools to watch
network traffic for a REST request with `access_token` in the URL while logging
in to your org admin account, and copy the `refresh_token` from the response
body to toolbox.globals in the mongo database. Make sure to close the browser
tab once you have the refresh token, because the Control Hub webpage will expire
your refresh token early if the browser is detected being idle for too long 
(less than 1 hour).

### Uninstallation
`./uninstall.sh` to uninstall this systemd service

### Start/Stop

`systemctl start webex-v4-toolbox-api.service` to start the application as a systemd service in Linux

`systemctl stop webex-v4-toolbox-api.service` to stop the application systemd service in Linux

`systemctl restart webex-v4-toolbox-api.service` to restart the application systemd service in Linux

### Logging

`journalctl -xef -u webex-v4-toolbox-api.service` to print current logs and follow new log entries for this service