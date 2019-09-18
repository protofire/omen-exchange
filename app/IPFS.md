### How to Prepare Your Website for IPFS
You need to build your app by running the following in the root of your project directory:
`ỳarn build`

You should now have an updated IPFS compatible build in the “build” folder of your React app.

Now that your app is prepared, we can host the app on IPFS.

We have two options:
#### A free service. 
[Pinata](https://pinata.cloud) is an easy alternative.
Follow these steps:
- Create an account
- Visit the Pinata Upload section and go to “Upload Directory”. 
- Simply browse your local machine for the directory containing your website’s build and click “Upload”. Once the upload is finished
- Visit the Pin Explorer. You should see the record with the "IPFS Hash" for your website at the top of the list.

#### A pay service. 
Self-hosting a node on a cloud provider like Digital Ocean or Aws.
Follow these steps:
- Create an IPFS node. There are a lot of guides to create an ipfs node on the internet.
- Once you have the node up and running, you’ll need to transfer your website’s build directory to the remote machine hosting your node. You can do this using SCP:
`scp -r buildFolder username@remoteAddress:folder`
Or you can clone your repository in the node and build your app rigth there.
- Add the folder to IPFS by running the following command:
`ipfs add -r  build`
- Look for the last hash that is output. This will be your hash on IPFS.

### How to check that the application works
To do so, you can visit:
- `https://ipfs.io/ipfs/HASH_IPFS_BUILD`
- `https://gateway.pinata.cloud/ipfs/HASH_IPFS_BUILD`
- `https://ipfs.infura.io/ipfs/HASH_IPFS_BUILD`

Application already build:
- [ipfs.io](https://ipfs.io/ipfs/QmbihMm18Vpfgrc4WSxpnYv5pAZaNaNQ4NeNQrLZbZC45N)
- [gateway.pinata.cloud](https://gateway.pinata.cloud/ipfs/QmbihMm18Vpfgrc4WSxpnYv5pAZaNaNQ4NeNQrLZbZC45N)
- [ipfs.infura.io](https://ipfs.infura.io/ipfs/QmbihMm18Vpfgrc4WSxpnYv5pAZaNaNQ4NeNQrLZbZC45N)
