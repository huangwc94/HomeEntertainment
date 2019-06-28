#!/usr/bin/env bash

cd client && yarn build && cd ..

cd server && yarn build && cd ..

mkdir -p ./build/public ./build/build

cp -r client/build/* ./build/public/
cp -r server/build/* ./build/build/
cp server/package.json ./build/

cd build && yarn && yarn start
