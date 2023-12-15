FROM node:18-slim
WORKDIR $HOME/app
COPY . .
RUN npm install
EXPOSE 12345
CMD node server.js
