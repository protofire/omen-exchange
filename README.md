# Omen compound integration.

## Compound protocol integration for Omen exchange.

* It allows forecast pool creators to select to have the pool reserves get automatically converted into compound tokens which means that while
the tokens are sitting in the pool they continually accrue interest.

This is achieved using contract proxy kit allowing the pool creator to transfer their selected token while the proxy internall converts
the tokens into compound tokens before depositing into the pool.

** This project was created in fulfillment of the Omen Gitcoin hack https://gitcoin.co/issue/dxdaohackathon/omen-exchange/1/100024191

Video demo https://youtu.be/stv9OIV8A3M

* Future work-
* Fund/Withdraw pool with either token or cTokens