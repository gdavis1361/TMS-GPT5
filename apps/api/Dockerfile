FROM node:20-alpine@sha256:df02558528d3d3d0d621f112e232611aecfee7cbc654f6b375765f72bb262799 as base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --silent || true
COPY . .
RUN npx -y nest build || true
EXPOSE 3001
CMD ["node", "dist/main.js"]

