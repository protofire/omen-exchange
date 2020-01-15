set -e # exit when any command fails

mkdir db
ganache-cli -d --db db -i 50 &
PID=$!

# deploy realitio contracts
(cd realitio/truffle && ../node_modules/.bin/truffle deploy --network development)
export REALITIO_ADDRESS=$(jq -r '.networks["50"].address' realitio/truffle/build/contracts/Realitio.json)

# deploy mock tokens
MOCK_CDAI_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["CDAI", 8]' ERC20.bin | jq -r .address)
MOCK_DAI_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["DAI", 18]' ERC20.bin | jq -r .address)
MOCK_USDC_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["USDC", 6]' ERC20.bin | jq -r .address)
MOCK_OWL_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["OWL", 18]' ERC20.bin | jq -r .address)
MOCK_WETH_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["WETH", 18]' ERC20.bin | jq -r .address)
MOCK_CHAI_ADDRESS=$(eth contract:deploy --pk '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' --abi 'constructor(string,uint8)' --args '["CHAI", 18]' ERC20.bin | jq -r .address)

# deploy conditional tokens contracts
(cd conditional-tokens-contracts && npm run migrate -- --network local)

# deploy conditional tokens market maker contracts
cd conditional-tokens-market-makers
npm run migrate -- --network develop
export CONDITIONAL_TOKENS_ADDRESS=$(jq -r '.networks["50"].address' build/contracts/ConditionalTokens.json)
cd ..

# deploy realitio proxy
cd realitio-gnosis-proxy
./node_modules/.bin/truffle migrate --network development
REALITIO_PROXY_ADDRESS=$(jq -r '.networks["50"].address' build/contracts/RealitioProxy.json)
cd ..

# save contracts addresses
echo "realitio: ${REALITIO_ADDRESS}" >> contracts_addresses.txt
echo "realitio arbitrator: $(jq -r '.networks["50"].address' realitio/truffle/build/contracts/Arbitrator.json)" >> contracts_addresses.txt
echo "mock cdai: ${MOCK_CDAI_ADDRESS}" >> contracts_addresses.txt
echo "mock dai: ${MOCK_DAI_ADDRESS}" >> contracts_addresses.txt
echo "mock usdc: ${MOCK_USDC_ADDRESS}" >> contracts_addresses.txt
echo "mock owl: ${MOCK_OWL_ADDRESS}" >> contracts_addresses.txt
echo "mock weth: ${MOCK_WETH_ADDRESS}" >> contracts_addresses.txt
echo "mock chai: ${MOCK_CHAI_ADDRESS}" >> contracts_addresses.txt
echo "conditional tokens: ${CONDITIONAL_TOKENS_ADDRESS}" >> contracts_addresses.txt
echo "market maker factory: $(jq -r '.networks["50"].address' conditional-tokens-market-makers/build/contracts/FPMMDeterministicFactory.json)" >> contracts_addresses.txt
echo "realitio proxy: ${REALITIO_PROXY_ADDRESS}" >> contracts_addresses.txt

# stop ganache
kill $PID
