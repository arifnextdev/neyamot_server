#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t neyamot-server:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "To run the container locally:"
    echo "docker run -p 3000:3000 --env-file .env neyamot-server:latest"
else
    echo "❌ Docker build failed!"
    exit 1
fi
