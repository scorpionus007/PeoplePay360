FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
