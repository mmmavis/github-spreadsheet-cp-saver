import habitat from 'habitat';
import request from 'request';
import path from 'path';
import _ from 'underscore';
import fs from 'fs';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GITHUB_API_BASE = `https://api.github.com`;
const GITHUB_OWNER = habitat.get(`GITHUB_OWNER`);
const GITHUB_REPO = habitat.get(`GITHUB_REPO`);
const GITHUB_TOKEN = habitat.get(`GITHUB_TOKEN`);

function postToGithub(method = `POST`, route, content, callback) {
  let options = {
    method: method,
    url: `${GITHUB_API_BASE}/${route}`,
    json: content,
    headers: {
      Accept: `application/vnd.github.v3+json`,
      "User-Agent": `MozFest 2017 proposal`,
      Authorization: `token ${GITHUB_TOKEN}`
    }
  };

  // Post to GitHub
  request(
    options,
    (err, response, body) => {
      if (err) {
        console.log(err);
        callback(err);
      } else if (response.statusCode !== 200 && response.statusCode !== 201) {
        let errorMsg = `[Error posting to GitHub] Response status HTTP ${response.statusCode}, GitHub error message: ${response.body.message}`;
        console.log(errorMsg);
        callback(errorMsg);
      } else {
        callback(null, body);
      }
    }
  );
}

function postRandomIssues() {
  let randomTitles = `cake lollipop wafer soufflé toffee tiramisu brownie pudding cake chocolate bar macaroon gummies cheesecake marshmallow croissant`;
  randomTitles = randomTitles.split(` `);

  for (let i=1; i<=5; i++) {
    let issue = {
      title: randomTitles[Math.floor(Math.random()*randomTitles.length)],
      body: ``
    };
    postToGithub(`POST`, `repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, issue, (error, body) => {
      if (error) console.log(error);
      console.log(`YEAH! Issue posted!`);
    });
  }
}

function formatGithubComment() {
  var pathToTemplate = path.normalize(`${__dirname}/../markdown-templates/comment-template.md`);
  var template = _.template(fs.readFileSync(pathToTemplate,`utf-8`));

  var comment = {
    additionalMessage: `Hello World`
  };

  return { body: template(comment) };
}


function postComment() {
  for (let issueNum=1; issueNum<=3; issueNum++) {
    postToGithub(`POST`, `repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNum}/comments`, formatGithubComment(), (error, body) => {
      if (error) console.log(error);
      console.log(`YEAH! Comment posted!`);
    });
  }
}

function closeIssue(issueNum) {
  postToGithub(`PATCH`, `repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNum}`, { state: `closed` }, (error, body) => {
      if (error) console.log(error);
      console.log(`YEAH! Issue #${issueNum} closed!`);
    });
}

postRandomIssues();
// postComment();

// closeIssue(2);
