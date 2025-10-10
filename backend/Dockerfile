# Backend Dockerfile
# Use Python base image that supports PyTorch
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python requirements for CNN+RNN model
COPY cnn_rnn_requirements.txt ./

# Install PyTorch and CNN+RNN dependencies
RUN pip install --no-cache-dir -r cnn_rnn_requirements.txt

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p ./uploads

# Set development environment for local Docker
ENV NODE_ENV=development

# Expose port
EXPOSE 5001

# Start the application
CMD ["node", "src/index.js"]