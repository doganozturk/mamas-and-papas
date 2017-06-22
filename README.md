# Mamas & Papas

A full-stack web app I created for studying purposes. Stack includes a simple back-end written with Restify (a NodeJs API framework) that exposes a search endpoint and uses Elasticsearch for full-text search, exact property matching and sorting data; a front-end app that heavily uses Gulp for automating dev and build tasks and simple static front-end architecture with HTML5, SASS and jQuery. All these are dockerized with docker-compose and ready to be fired up with a simple ``docker-compose up`` command.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

If you want to set up a development environment for the project , you need these:

--- NodeJs v6.11.0: Both API and client uses that version of Node.

--- Elasticsearch v5.4.2: Sample data is indexed and served by using Elasticsearch.

### Installing

To set up a development environment running

#### API

First run Elasticsearch.

```
elasticsearch
```
then index sample data:
```
npm run index
```
then use below command for running the app with Nodemon:
```
npm run dev
```
Then you can access the search endpoint from:
```
http://localhost:3002/searh/quick?keyword=blablabla
```

#### CLIENT

Build sprite, css and js files with Gulp without minification or uglification on dev environment. This command also gives you a simple dev server with auto-reloading (Browser-Sync) going on:

```
npm run dev
```
This serves static files from:
```
http://localhost:3000
```

### Installing with Docker
```
docker-compose up
```
command creates or starts already created API, client and Elasticsearch containers. This command uses 
```
npm run dist
```
for both api and client, so on client side you have minified css, html and uglified js. Client still uses Gulp ``serve`` functionality for practical reasons but serving from
```
http://localhost:3001
```
API container is waiting for Elasticsearch to get usable and it automatically does deleting already indexed data, indexing again, showing indeces and fire up the server with ``node`` command this time.

### Improvements
Some improvements that can be implemented with more work:

--- Environment variables: For practical reasons docker-compose up creates a prod-like environment. For example; elasticsearch host is 177.22.02 on the project because it needs to work in a container environment; but for development this should change to http://localhost:9200. These hardcoded variables should be transferred to some .env files and docker-compose should be improved with these environment variables.

--- Client should be served from a NGINX container: Again for practical reasons, there is no NGINX container in docker-compose.yml file. All static files is dist folder should be moved to a path where NGINX can serve them with appropriate port and other configuration.

--- Sourcemaps: For CSS and JS, there should be sourcemaps on production. Creating sourcemaps when concatenating different CSS and JS files created some problems.

--- Elasticsearch query: Data is mapped automatically. That can be done manually; also type-tolerant matching should be improved with Ngram filters or so on. 

--- A RabbitMQ instance for improving communication between Docker instances.


## Author

* **Doğan Öztürk** - [Github](https://github.com/doganozturk)