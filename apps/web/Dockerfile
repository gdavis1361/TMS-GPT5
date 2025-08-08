FROM node:20-alpine@sha256:9a476f1a901b7b6e9b4d4d1c7c7e8d73c8f38ac2f9f3a3d9b6f0d2c1f1a2b3c4
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm i --silent || true
COPY . .
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "dev"]

