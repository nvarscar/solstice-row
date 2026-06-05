FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x /app/scripts/init.sh

EXPOSE 3000

CMD ["sh", "/app/scripts/init.sh"]
