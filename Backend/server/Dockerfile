FROM node:20

RUN apt-get update && apt-get install -y \
    openjdk-21-jdk \
    python3 \
    gcc \
    g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
