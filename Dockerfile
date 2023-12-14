FROM node:18-slim
WORKDIR $HOME/app
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/Rob--W/cors-anywhere.git cors-anywhere
WORKDIR $HOME/app/cors-anywhere
RUN npm install
RUN npm install http-server -g
COPY . $HOME/app
WORKDIR $HOME/app
VOLUME /data
ENV PORT=12349
CMD node ./cors-anywhere/server.js &
EXPOSE 12345
CMD http-server -p 12345
