# Docker

This Dockerfile builds an image for a container that runs `ganache-cli` with the necessary contracts pre-deployed. To
build it, do:

```
docker build -t gnosis-cond-ganache .
```

And then run it:

```
docker run -it -p 127.0.0.1:8545:8545 --rm gnosis-cond-ganache
```

The addresses of the contracts are saved in a file inside the container. You can see them with:

```
docker run -it --rm gnosis-cond-ganache cat contracts_addresses.txt
```
