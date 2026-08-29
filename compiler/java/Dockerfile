FROM node:20

RUN apt-get update && \
    apt-get install -y openjdk-17-jdk

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
