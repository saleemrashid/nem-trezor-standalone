# nem-trezor-standalone

Offline tool for recovering NEM private keys from BIP39 mnemonics and importing
them into NanoWallet

## Usage

You should use this tool on an offline computer.

Open [`index.html`](index.html) and click the Download button.

`index.html` is a standalone HTML page containing all the CSS and JavaScript
required for this tool, allowing you to use it completely offline.

**Do not use `src/index.html` as it will not work offline.**

## Build

1. Install [Yarn](https://yarnpkg.com/en/) for secure dependency management

2. Build standalone `index.html` (this will be identical to the file included
   in this repository)

```bash
yarn
yarn build
```

3. Open `index.html` (or copy to an offline computer)
