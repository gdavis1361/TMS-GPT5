FROM node:20-alpine as base
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm i --silent || true
COPY . .
RUN npx -y nest build || true
EXPOSE 3001
CMD ["node", "dist/main.js"]

