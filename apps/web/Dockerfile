FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm i --silent || true
COPY . .
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "dev"]

