FROM nginx:1.19.0-alpine

COPY default.conf /etc/nginx/conf.d/
COPY gzip.conf /etc/nginx/conf.d/

CMD ["nginx", "-g", "daemon off;"]

