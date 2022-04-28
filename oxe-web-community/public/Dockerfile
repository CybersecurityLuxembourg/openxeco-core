# See: https://lipanski.com/posts/smallest-docker-image-static-website
FROM alpine:3.13.2

ARG TARGET_DIR

# Install thttpd
RUN apk add thttpd

# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/static

# Copy the static website
# Use the .dockerignore file to control what ends up inside the image!
COPY --chown=static $TARGET_DIR/ .

# Remove exec right on files
RUN find /home/static -type f -print0 | xargs -0 chmod a-x

EXPOSE 3001

# Run thttpd
USER static
CMD ["thttpd", "-D", "-h", "0.0.0.0", "-p", "3001", "-d", "/home/static", "-u", "static", "-l", "-", "-M", "60"]