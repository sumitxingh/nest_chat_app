# Use Node.js as base image
FROM node:20

# Create and set the working directory
WORKDIR /app

# Print the current directory and list files
RUN echo "Current directory after WORKDIR:" && pwd && ls -al

# Copy package.json and yarn.lock to work directory
COPY package.json yarn.lock ./

# Print the current directory and list files
RUN echo "Current directory after copying package.json and yarn.lock:" && pwd && ls -al

# Install dependencies using Yarn
RUN yarn

# Copy the rest of the application code to work directory
COPY . .

# Print the current directory and list files
RUN echo "Current directory after copying application code:" && pwd && ls -al

# Expose the port your app runs on
EXPOSE 4500

# Command to run the application
CMD ["yarn", "start:dev"]
