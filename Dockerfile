### Build and serve fragments microservice ###

####################################### Stage 0: Install alpine Linux + node + dependencies #######################################

# Use node version 16.15.1
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS dependencies

LABEL maintainer="Sanjida Afrin <safrin2@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set Production environment
ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

#######################################  Stage 1: use dependencies to deploy the site #######################################

# Use node version 16.15.1
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS deploy

# Add init process and curl
RUN apk update && apk add --no-cache \
    dumb-init=1.2.5-r1 \
    curl=7.80.0-r2

# Use /app as our working directory
WORKDIR /app

# Copy cached dependencies from previous stage so we don't have to download
COPY --chown=node:node --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Change the owner
USER node

# We run our service on port 8080
EXPOSE 8080

# Health check to see if the docker instance is healthy
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1

# Start the container by running our server
ENTRYPOINT ["dumb-init", "--"]

CMD [ "node", "src/index.js" ]

