FROM node:18-slim
WORKDIR $HOME/app
COPY . .
RUN npm install
EXPOSE 23456
CMD node server.js
