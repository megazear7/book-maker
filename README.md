# Book Maker

## Install

```sh
nvm use 22
npm install
```

## Prep

Obtain an api key for a model and set an environment variable as shown below in `.env`

```sh
GROK_BASE_URL='https://api.x.ai/v1'
GROK_API_KEY=''
GPT_API_KEY=''
AZURE_API_KEY=''
OPENAI_API_KEY=''
ANTHROPIC_API_KEY=''
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
