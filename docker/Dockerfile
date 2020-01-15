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

RUN git clone https://github.com/gnosis/conditional-tokens-market-makers.git && \
  cd conditional-tokens-market-makers && \
  git checkout 1556d13053450521846b15659d933c874c8e06ff && \
  npm install

RUN git clone https://github.com/fvictorio/realitio-gnosis-proxy && \
  cd realitio-gnosis-proxy && \
  git checkout 040dce3e9c0c8edbb36767e7b029bbe6ccf1af4a && \
  yarn

# deploy contracts in ganache
COPY prepare_db.sh ERC20.bin ./
RUN bash prepare_db.sh

EXPOSE 8545

CMD ["./node_modules/.bin/ganache-cli", "-d", "--db", "db", "-h", "0.0.0.0", "-i", "50"]
