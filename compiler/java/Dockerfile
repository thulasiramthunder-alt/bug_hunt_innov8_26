FROM node:20

RUN apt-get update && apt-get install -y openjdk-8-jdk

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
