FROM node:21.6.2

# Create app directory
RUN mkdir -p /usr/src/shipping-app-server
WORKDIR /usr/src/shipping-app-server

# Install app dependencies
COPY package.json /usr/src/shipping-app-server
RUN npm install

# Bundle app source
COPY . /usr/src/shipping-app-server

# Build arguments
ARG NODE_VERSION=21.6.2

# Environment
ENV NODE_VERSION $NODE_VERSION