FROM node:22-alpine
WORKDIR /app

# Install OS dependencies for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

# Copy application code
COPY backend .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:docker"]
