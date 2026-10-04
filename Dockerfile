# Alternative zu Azure App Service (z.B. für einen eigenen Server)
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY public ./public
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]
EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:8080/healthz || exit 1
CMD ["node", "server/index.js"]
