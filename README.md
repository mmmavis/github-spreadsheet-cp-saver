# GitHub <-> Spreadsheet Cmd-C(Ctrl-C) Cmd-V(Ctrl-C) Saver

These scripts are designed to save a ton of search and copy-and-paste work for the MozFest 2017 Program Team.

🔺🔺🔺 **Working in progress** and docs to be added soon... 🔺🔺🔺

### Caution!

Use these scripts at your own risk as there's no test script conducted to verify things always work as expected.:wink:

### Current Available Scripts

1. Get standard rejected proposals
2. Get flagged rejected proposals
3. Auto comment and close all unsuccessful proposals

### Requirements for Development

- node
- npm

### Setup for Development

- `git clone -b master https://github.com/mmmavis/github-spreadsheet-cp-saver.git`
- `cd github-spreadsheet-cp-saver`
- `cp sample.env .env`
- update values in `.env` file
- `npm install`
- `npm start`

### To Run the Scripts

- `node run build`
- `node dist/app.js` to bring up the script selection menu in terminal
