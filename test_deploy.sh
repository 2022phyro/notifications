#!/bin/bash
current_datetime=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
filename="server_${current_datetime}.tar.gz"
cd "$HOME/Desktop/projects/notifications"
rm -rf *.gz
tar -czvf "$filename" --exclude=node_modules --exclude=.git --exclude=.vscode --exclude=logs ./server || echo "tar command failed"
scp $filename dev:~/"$filename"
ssh dev << EOF
  # Unzip the contents to a folder called "server" in ~/
  echo "Unzipping to server folder"
  tar -xzvf ~/"$filename" -C ~/ --strip-components=1
  cd ~/server
  echo "Running Installation"
  npm install
  echo "Starting the services"
  sudo service notifai_web restart
  sudo service notifai_grpc restart
  echo "Remote operations completed successfully"
EOF

echo "Script execution completed"