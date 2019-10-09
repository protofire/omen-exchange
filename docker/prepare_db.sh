mkdir db
ganache-cli -d --db db -i 50 &
PID=$!

# deploy realitio contracts
(cd realitio/truffle && ../node_modules/.bin/truffle deploy --network development)

# deploy mock Dai
MOCK_DAI_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' Dai.bin | jq .address)

# deploy conditional tokens contracts
(cd conditional-tokens-contracts && npm run migrate -- --network local)

# deploy conditional tokens market maker contracts
cd conditional-tokens-market-makers
cat << EOF > truffle-local.js
module.exports = {
  networks: {
    local: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  }
}
EOF
npm run migrate -- --network local
cd ..

# save contracts addresses
echo "realitio: $(jq '.networks["50"].address' realitio/truffle/build/contracts/Realitio.json)" >> contracts_addresses.txt
echo "realitio arbitrator: $(jq '.networks["50"].address' realitio/truffle/build/contracts/Arbitrator.json)" >> contracts_addresses.txt
echo "mock dai: ${MOCK_DAI_ADDRESS}" >> contracts_addresses.txt
echo "conditional tokens: $(jq '.networks["50"].address' conditional-tokens-contracts/build/contracts/ConditionalTokens.json)" >> contracts_addresses.txt
echo "market maker factory: $(jq '.networks["50"].address' conditional-tokens-market-makers/build/contracts/FixedProductMarketMakerFactory.json)" >> contracts_addresses.txt

# stop ganache
kill $PID
