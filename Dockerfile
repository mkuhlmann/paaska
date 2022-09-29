FROM node:alpine
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app
RUN npm prune --omit dev

CMD ["npm", "start"]