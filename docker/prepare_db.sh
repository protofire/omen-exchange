mkdir db
ganache-cli -d --db db -i 50 &
PID=$!

# deploy realitio contracts
(cd realitio/truffle && ../node_modules/.bin/truffle deploy --network development)

# save contracts addresses
echo "realitio: $(jq '.networks["50"].address' realitio/truffle/build/contracts/Realitio.json)" >> contracts_addresses.txt

kill $PID
