#!/usr/bin/env bash

git pull

docker container stop he
docker container rm he
docker container prune -y
docker image prune -y

docker build . --no-cache -t home-entertainment || exit 1


docker run -d --restart always -p 80:80 --name he -e WECHAT_APP -e WECHAT_TOKEN -e WECHAT_SECRET -e WECHAT_EKEY -e HE_PASSWORD -e NODE_ENV=production home-entertainment
