FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev icu-dev \
    oniguruma-dev libxml2-dev curl-dev autoconf g++ make

RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd intl zip pdo_mysql opcache mbstring xml curl bcmath

RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
