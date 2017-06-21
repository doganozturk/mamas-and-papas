FROM node:6.11.0
RUN mkdir -p /srv/mamas-and-papas/api
COPY . /srv/mamas-and-papas/api/
WORKDIR /srv/mamas-and-papas/api/
RUN yarn
RUN npm run dist

EXPOSE 3002 9200