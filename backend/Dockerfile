FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/index.js"]
