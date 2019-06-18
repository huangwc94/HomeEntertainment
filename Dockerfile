FROM node

RUN apt-get update && apt-get upgrade -y && npm install -g yarn

WORKDIR /build

COPY . /build

# build dependency
RUN mkdir -p /app/public /app/build
RUN cd client && yarn
RUN cd server && yarn && cp package.json /app && cd /app && yarn

# build app
RUN cd client && yarn build && cp -r ./build/* /app/public/
RUN cd server && yarn test && yarn build && cp -r ./build/* /app/build/

EXPOSE 80

WORKDIR /app

CMD npm start


