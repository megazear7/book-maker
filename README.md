# Book Maker

## Install

```sh
nvm use 22
npm install
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

## Prep

We will pretend the books name is `book-abc` for the purpose of explaining how to use this system.

1. Create a folder at `data/book-abc`
1. Under this folder create a `chapters.json` file, an `overview.md` file, and a `chapters` folder
1. The `chapters.json` file should contain a `BookByChapters` object, as specified in `src/types/standard.ts`
1. The `overview.md` file should contain as detailed of information as you can provide about the book. Summarize the plot and story, character arcs, key locations, setting details, plot devices, and key story elements.
1. Under the `chapters` folder, the AI will write the chapter outline and content.

## Create the Book

Configure the `book-maker.config.json` file per the instructions of the BookMakerConfig object as defined in `src/types/standard.ts`

Then run the below command.

```sh
npm run create
```
