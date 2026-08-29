FROM node:20

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jdk && \
    rm -rf /var/lib/apt/lists/*

# DEBUG: verify Java installation during Docker build
RUN echo "===== JAVA INSTALLATION CHECK =====" && \
    java -version && \
    javac -version && \
    which java && \
    which javac && \
    echo "JAVA_HOME=$JAVA_HOME" && \
    echo "PATH=$PATH"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]