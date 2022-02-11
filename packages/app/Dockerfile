FROM node:16

# Create app directory
WORKDIR /usr/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY . .

RUN npm install --force
RUN npm run build:dist

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
ENV listenPort=8000

EXPOSE $listenPort

CMD [ "node", "server.js" ]