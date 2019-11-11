FROM node:10

RUN apt-get update && apt-get install -y jq

WORKDIR ganache
ENV PATH="./node_modules/.bin:${PATH}"
RUN npm install ganache-cli@6.6.0 eth-cli@2.0.0-beta-5

# clone realitio and install dependencies
RUN git clone https://github.com/realitio/realitio-contracts.git realitio && \
  cd realitio && \
  git checkout ada36fd5031e863526a1d580cc6638937b3500fb && \
  npm install

RUN git clone https://github.com/gnosis/conditional-tokens-contracts.git && \
  cd conditional-tokens-contracts && \
  git checkout 7ad77eb4cba295b12de4d9f5977d641eeb2044ae && \
  npm install

RUN git clone https://github.com/mariano-aguero/conditional-tokens-market-makers.git && \
  cd conditional-tokens-market-makers && \
  git checkout a9f7b1b96ea082581dbd50e03f4299f0d6a05695 && \
  npm install

RUN git clone https://github.com/fvictorio/realitio-gnosis-proxy && \
  cd realitio-gnosis-proxy && \
  git checkout 4e7631b156ccdd972c8715802fa23b85b1c0ef4a && \
  yarn

# deploy contracts in ganache
COPY prepare_db.sh ERC20.bin ./
RUN bash prepare_db.sh

EXPOSE 8545

CMD ["./node_modules/.bin/ganache-cli", "-d", "--db", "db", "-h", "0.0.0.0", "-i", "50"]
