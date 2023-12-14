FROM node:18-slim
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH
WORKDIR $HOME/app
RUN apg-get update && apg-get install -y git
RUN git clone https://github.com/Rob--W/cors-anywhere.git cors-anywhere
COPY cors-anywhere/package.json .
RUN npm install
RUN npm install http-server -g
COPY --chown=user . $HOME/app
VOLUME /data
ENV PORT=12349
RUN node ./cors-anywhere/server.js &
EXPOSE 12345
RUN http-server -p 12345
