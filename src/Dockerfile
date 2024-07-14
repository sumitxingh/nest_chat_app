# Use Node.js as base image
FROM node:20

# Create and set the working directory
WORKDIR /app /upload

# Copy package.json and yarn.lock to work directory
COPY ../package.json  ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code to work directory
COPY . .

# Expose the port your app runs on
EXPOSE 4500

# Command to run the application
CMD ["yarn", "start:dev"]
