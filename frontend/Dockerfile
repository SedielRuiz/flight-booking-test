FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the Angular app
RUN npm run build --configuration=production

# Serve with Nginx
FROM nginx:alpine

# Copiamos el build. Angular 17/18 usa /browser por defecto en el application builder.
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
