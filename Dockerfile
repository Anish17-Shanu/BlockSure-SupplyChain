FROM node:22-alpine
WORKDIR /app
COPY . .
EXPOSE 8082
CMD ["node", "server.js"]
