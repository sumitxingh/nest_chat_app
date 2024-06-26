# Use Node.js as base image
FROM node:20

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to work directory
COPY . .

# Expose the port your app runs on
EXPOSE 4200

# Generate Prisma client and run migrations
RUN npx prisma generate
RUN npx prisma migrate dev

# Command to run the application
CMD ["npm", "run", "start:dev"]
