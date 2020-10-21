#!/bin/sh
echo "running yarn"
yarn
if [ $? -eq 0 ]; then
  echo "edit .env file first"
  vim .env
  echo "installing systemd service..."
  sudo cp systemd.service /lib/systemd/system/go-cms-api.service
  echo "enabling systemd service..."
  sudo systemctl enable go-cms-api.service
  echo "starting systemd service..."
  systemctl start go-cms-api.service
  echo "install go-cms-api.service is complete."
else
  echo "yarn failed"
fi
