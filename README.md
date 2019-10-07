# Setup for running the script

## Setup Node Environment

The Node version is specified in the `package.json` file. I use `nvm` to manage
the node version on my system, which you can install here [here](https://github.com/nvm-sh/nvm).  Whatever approach you use, ensure you have it set to `>= v10`.

## Setup and run script

After the `node` version has been set, follow these steps to run the script:

from the root of the repo:

1. clone the repo
2. `cd json-duplicates-js`
3. `npm install`
5. `./deduplicate_leads`

## Clean up script

To remove all generated files and reset the change log, run:

`./clean_files`

## Run the test

`npm test`

## When the script is run, it will produce the following results:
- Output the valid leads as json into a generated file labeled "valid-leads"
  with a timestamp
- Create an entry in the change_log.txt file with a representation
  of the input (before) and output (after) with a text summary of valid and removed
