FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY vendor ./vendor
RUN node scripts/build.mjs
COPY server ./server
COPY public ./public
ENV NODE_ENV=production PORT=3000 ARCADE_DB_PATH=/data/arcade.sqlite
EXPOSE 3000
CMD ["node", "server/index.mjs"]
