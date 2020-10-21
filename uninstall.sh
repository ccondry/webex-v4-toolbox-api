#!/bin/sh
echo "stopping systemd service..."
sudo sudo /bin/systemctl stop go-cms-api.service
echo "systemd service is stopped."
echo "disabling systemd service..."
sudo systemctl disable go-cms-api.service
echo "systemd service now disabled."
echo "removing systemd service file..."
sudo rm /lib/systemd/system/go-cms-api.service
echo "removed systemd service file."
echo "uninstall complete. you can now remove this folder."
