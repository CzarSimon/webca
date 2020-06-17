# Stage 1 - the build process
FROM node:12.18.0-alpine3.12 AS builder
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm run build

# Stage 2 - the production environment
FROM nginx:1.19.0-alpine AS runtime
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
