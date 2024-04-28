#!/bin/bash

cd "$HOME/Desktop/projects/notifications"
rm -rf *.gz
tar -czvf server.tar.gz --exclude=node_modules --exclude=.git --exclude=.vscode --exclude=logs .
scp -i ~/.ssh/notifai server.tar.gz ubuntu@52.23.179.93:/home/ubuntu
