FROM --platform=linux/amd64 node:13.8.0-stretch
#WORKDIR /react-docker-example/
#COPY public/ /react-docker-example/public
#COPY src/ /react-docker-example/src
#COPY package.json /react-docker-example/
COPY . .
RUN npm install

#EXPOSE 80
EXPOSE 3000 80
CMD ["npm", "start"]
#ENTRYPOINT npm run start

#FROM node:16-alpine
## Set the working directory to /app inside the container
#WORKDIR /app
## Copy app files
#COPY . .
## ==== BUILD =====
## Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
#RUN npm ci
## Build the app
#RUN npm run build
## ==== RUN =======
## Set the env to "production"
#ENV NODE_ENV production
## Expose the port on which the app will be running (3000 is the default that `serve` uses)
#EXPOSE 3000
## Start the app
#CMD [ "npx", "serve", "build" ]