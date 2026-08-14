FROM node:24-alpine

# PHP est requis par le plugin Wayfinder de Vite
RUN apk add --no-cache php84 php84-tokenizer php84-mbstring php84-xml php84-phar php84-openssl php84-dom php84-xmlwriter php84-session php84-ctype php84-fileinfo php84-pdo php84-pdo_mysql && ln -sf /usr/bin/php84 /usr/bin/php

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
