FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 8000

# Start the dev server
CMD ["npm", "run", "dev"]
