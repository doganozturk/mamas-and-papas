#!/bin/bash

while ! curl 172.22.0.2:9200; do sleep 1; done;

npm run dist