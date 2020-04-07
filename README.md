[![Netlify Status](https://api.netlify.com/api/v1/badges/2da38309-7dbe-43bb-bb2a-ba3186bc3556/deploy-status)](https://app.netlify.com/sites/conditional/deploys)

# gnosis-conditional-exchange

## Building

The app code lives in the `app` folder. Use `yarn` to install dependencies.

```bash
cd app/
yarn
```

Create a `.env` file. See `.env.example` for environment variables which may be set.

> **Note for Corona Information Markets**
>
> Build directly with `react-scripts`:
>
> ```bash
> npx react-scripts build
> ```
>
> Make sure you do *not* use `yarn build`. The build script alters `react-scripts` to support building with 3Box. If you use `yarn build`, reinstall the dependencies to build optimally for Corona Information Markets.

For normal Omen builds, use `yarn build`, but for Corona Information Markets, see note above.

The `build` directory in the `app` directory will now contain the build to be served.
