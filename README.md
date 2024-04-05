# Sparrow API

This is the API behind [sparrow-cli](https://github.com/dmdboi/sparrow-cli) which lets you track daily completed tasks/goals in a D1 database.

## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm install`
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the API to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.

## Development

1. Run `wrangler dev` to start a local instance of the API.
2. Open `http://localhost:9000/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.

## Authentication

To add authentication to your project, simply generate a random token and add it to your wrangler.toml file like so 

```
[vars]
AUTH_TOKEN = "test-xxx"
```