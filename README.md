# go-cms-api
This is the REST API service for the dCloud GoCMS instant demo web portal.

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

### Uninstallation
`./uninstall.sh` to uninstall this systemd service

### Start/Stop

`systemctl start go-cms-api.service` to start the application as a systemd service in Linux

`systemctl stop go-cms-api.service` to stop the application systemd service in Linux

`systemctl restart go-cms-api.service` to restart the application systemd service in Linux

### Logging

`journalctl -xef -u go-cms-api` to print current logs and follow new log entries for this service