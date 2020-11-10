#!/bin/sh
echo "stopping systemd service..."
sudo sudo /bin/systemctl stop webex-v4-toolbox-api.service
echo "systemd service is stopped."
echo "disabling systemd service..."
sudo systemctl disable webex-v4-toolbox-api.service
echo "systemd service now disabled."
echo "removing systemd service file..."
sudo rm /lib/systemd/system/webex-v4-toolbox-api.service
echo "removed systemd service file."
echo "uninstall complete. you can now remove this folder."
