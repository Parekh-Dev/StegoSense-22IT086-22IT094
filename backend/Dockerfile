# Backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p /uploads

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5001

# Start the application
CMD ["node", "src/index.js"]