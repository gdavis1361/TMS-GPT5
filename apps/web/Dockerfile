FROM node:20-alpine@sha256:df02558528d3d3d0d621f112e232611aecfee7cbc654f6b375765f72bb262799
WORKDIR /app
# Build from monorepo root so Next can access tsconfig.base.json without host mounts
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY tsconfig.base.json ./tsconfig.base.json
RUN npm ci --silent
COPY ./apps/web ./
RUN ln -sf /app/tsconfig.base.json /tsconfig.base.json
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "dev"]

