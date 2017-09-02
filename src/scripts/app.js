import habitat from 'habitat';
import prompt from 'prompt';
import chalk from 'chalk';
import fs from 'fs';
import moment from 'moment';
import GithubApiHelper from './lib/github-api-helper';
import getStandardRejectedProposals from './get-standard-rejected-proposals';
import getFlaggedRejectedProposals from './get-flagged-rejected-proposals';
import commentAndCloseProposals from './comment-and-close-proposals';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GITHUB_OWNER = habitat.get(`GITHUB_OWNER`);
const GITHUB_REPO = habitat.get(`GITHUB_REPO`);
const SCRIPT_OPTIONS = [
  {
    title: `Get standard rejected proposals`,
    funcToRun: getStandardRejectedProposals
  },
  {
    title: `Get flagged rejected proposals`,
    funcToRun: getFlaggedRejectedProposals
  },
  {
    // Open issues with no milestone
    title: `Auto comment and close all unsuccessful proposals (WARNING: script will start right away)`, 
    funcToRun: commentAndCloseProposals
  }
];
const PROMPT_PROPERTIES = [
  {
    name: `script_num`,
    description: `Choose the script you would like to run`,
    type: `integer`,
    required: true,
    message: `Input must be an integer from 1 to ${SCRIPT_OPTIONS.length}.`,
    conform: function(value) {
      return value >= 1 && value <= SCRIPT_OPTIONS.length;
    }
  },
  {
    name: `confirm_to_run_script_3`,
    description: `Are you sure you want to run script #3? This action cannot be reverted. (Y/N)`,
    type: `string`,
    required: true,
    message: `Input must be 'y' or 'n' (without the quotes).`,
    ask: function() {
      return prompt.history("script_num").value === 3;
    },
    conform: function(value) {
      return value.toLowerCase() === `y` || value.toLowerCase() === `n`;
    }
  }
];

prompt.message = `✧✧✧ `;
prompt.start();

function printListOfOptions(introLine, options) {
  console.log(chalk.bold(`\n${introLine}                         \n`));
  options.forEach((option, i) => {
    console.log(chalk.bold(`  ${i+1}) ${option.title}`));
  });
  console.log(`\n`);
}

function printAndRecordLog(timestamp, scriptNum, typeOfActionDone) {
  let log = `[${timestamp}] Script #${scriptNum} ${typeOfActionDone}.`;

  console.log(chalk.red(log));

  fs.appendFile(`./log/activity-log.txt`, `${log}\n`, `utf8`, (fileWriteErr) => {
    if (fileWriteErr) console.log(fileWriteErr);
  });
}

console.log(chalk.bold.white.bgRed(`\n **********   Target GitHub Repo >>> ${GITHUB_OWNER}/${GITHUB_REPO} ********** \n`));
printListOfOptions(`Available scripts`, SCRIPT_OPTIONS);

prompt.get(PROMPT_PROPERTIES, function (err, result) {
  if (err) {
    console.log(err);

    return;
  }

  let scriptNum = result.script_num;
  let confirmToRunScript3 = scriptNum === 3 && result.confirm_to_run_script_3 === `y`;

  printAndRecordLog(moment().local().format('YYYY-MM-DD HH:mm:ss'), scriptNum, `selected`);

  if (scriptNum !== 3 || confirmToRunScript3) {
    SCRIPT_OPTIONS[scriptNum-1].funcToRun(GITHUB_OWNER, GITHUB_REPO, () => {
      printAndRecordLog(moment().local().format('YYYY-MM-DD HH:mm:ss'), scriptNum, `run`);
    });
  }

  if (scriptNum === 3 && !confirmToRunScript3) {
    printAndRecordLog(moment().local().format('YYYY-MM-DD HH:mm:ss'), scriptNum, `not run`);
  }
});
