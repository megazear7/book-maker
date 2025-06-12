# Book Maker

## Install

```sh
nvm use 22
npm install
```

## Prep

Obtain an api key, base url, and model name that is compatible with
the OpenAI sdk and set the environment variables as shown below:

```sh
ABC_MODEL_NAME=''
ABC_API_KEY=''
ABC_BASE_URL=''
```

## Build

```sh
npm run build
```

## Lint

```sh
npm run lint
npm run fix
```

## Run

```sh
npm run watch
```

Open http://localhost:3000/
