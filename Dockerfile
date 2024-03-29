FROM node:alpine
RUN apk add --no-cache docker-cli docker-compose git openssh-client ca-certificates
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app
RUN npm prune --omit dev

CMD ["npm", "start"]