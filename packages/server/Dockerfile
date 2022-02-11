FROM node:16

# Create app directory
WORKDIR /usr/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source

ENV listenPort=3000
ENV wsPort=3001

ENV BCRYPT_ROUNDS=2
ENV signLifetime=300
ENV signLocation=amimet_api
ENV db_driver=mongodb
ENV db_port=27017

EXPOSE $listenPort
EXPOSE $wsPort

CMD [ "node", "dist/index.js" ]