# Build context is the repo root (see docker-compose.yml), not this
# directory — npm workspaces need the root package.json/package-lock.json,
# and the site needs counters-data-core's compile step to produce
# static/api/v1 before the SvelteKit build runs.
#
# Serves the real adapter-static output as plain static files (nginx, not
# `vite preview`), so local offline/PWA testing exercises the same
# static-file-serving model GitHub Pages actually uses in production.
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run compile --workspace=counters-data-core
RUN npm run build --workspace=counters-web

FROM nginx:alpine
COPY --from=build /app/packages/counters-web/build /usr/share/nginx/html
COPY packages/counters-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
