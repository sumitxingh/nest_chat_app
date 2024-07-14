# Use Node.js as base image
FROM node:20

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application code to work directory
COPY . .

# Expose the port your app runs on
EXPOSE 4500

# Command to run the application
CMD ["yarn", "start:dev"]
