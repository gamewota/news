## Multi-stage Dockerfile for building and running the Astro site
FROM node:20-alpine AS build
WORKDIR /app

# Allow passing the backend URL at build time so SSG can fetch data during `npm run build`
ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=${PUBLIC_BACKEND_URL}

# Install dependencies (including devDeps needed for build)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=${PUBLIC_BACKEND_URL}

# Copy built site and production node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Default port for astro preview
EXPOSE 8080

# Recommend passing PUBLIC_BACKEND_URL at runtime if different from build-time
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
