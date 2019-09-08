FROM node:10.15.3-slim@sha256:88da5cd281ece24309c4e6fcce000a8001b17804e19f94a0439954568716a668

WORKDIR /app

RUN  apt-get update \
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable --no-install-recommends \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh

COPY package*.json ./
COPY ./src ./
COPY ./protos ./

RUN npm ci

ENV DEBUG true
ENV THREADS 3

EXPOSE 3001
CMD ["node", "./server.js", "DEBUG=${DEBUG}", "THREADS=${THREADS}"]
