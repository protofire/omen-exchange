FROM node:10

RUN apt-get update && apt-get install -y jq

WORKDIR ganache
ENV PATH="./node_modules/.bin:${PATH}"
RUN npm install ganache-cli@6.6.0

# clone realitio and install dependencies
RUN git clone https://github.com/realitio/realitio-contracts.git realitio && \
  cd realitio && \
  git checkout ada36fd5031e863526a1d580cc6638937b3500fb && \
  npm install

# deploy contracts in ganache
COPY prepare_db.sh .
RUN bash prepare_db.sh

EXPOSE 8545

CMD ["./node_modules/.bin/ganache-cli", "-d", "--db", "db", "-h", "0.0.0.0", "-i", "50"]
