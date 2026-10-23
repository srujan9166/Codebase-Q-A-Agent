# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first to cache node_modules layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build the production bundle
COPY . ./
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx
# ==========================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx website
RUN rm -rf ./*

# Copy built static files from builder stage
COPY --from=builder /app/dist .

# Copy our custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
