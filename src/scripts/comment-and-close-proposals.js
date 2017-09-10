import GithubApiHelper from './lib/github-api-helper';
import moment from 'moment';
import path from 'path';
import _ from 'underscore';
import fs from 'fs';

function formatGithubComment() {
  let pathToTemplate = path.normalize(`${__dirname}/markdown-templates/comment-template.md`);
  let template = _.template(fs.readFileSync(pathToTemplate,`utf-8`));

  let data = {
    additionalMessage: ``
  };

  return { body: template(data) };
}

function commentAndCloseIssue(issueNum, cb) {
  console.log(`>> commentAndCloseIssue`, issueNum);
  GithubApiHelper.commentOnIssue(issueNum, formatGithubComment(), (commentError) => {
    if (commentError) {
      cb(commentError);
    } else {
      console.log(`GitHub Issue #${issueNum} commented.`);
      GithubApiHelper.closeIssue(issueNum, (closeIssueError) => {
        if (closeIssueError) {
          cb(closeIssueError);
        } else {
          console.log(`GitHub Issue #${issueNum} closed.`);
          cb();
        }
      });
    }
  });
}

function commentAndCloseIssueWithDelay(issuesLeftToPost, waitTime) {
  // add some delay here so we don't violate GitHub's rate limit
  // https://developer.github.com/v3/#rate-limiting
  setTimeout(function() {
    if (issuesLeftToPost.length > 0) {
      let issue = issuesLeftToPost.shift();
      let now = Date.now();
      console.log(issue.number, now, moment.utc(now).local().toString());

      commentAndCloseIssue(issue.number, (commentAndCloseError) => {
        if (commentAndCloseError) console.log(commentAndCloseError);
        console.log(`<< commentAndCloseIssue`, issue.number);
        console.log(`\n`);
        commentAndCloseIssueWithDelay(issuesLeftToPost, waitTime);
      });
    } else {
      console.log(`=== DONE ================`);
    }
  }, waitTime);
}

export default function(githubOwner, githubRepo, cb) {
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `no:milestone`,
    `author:mozfest-bot`
  ];

  GithubApiHelper.search(`issues`, { q: SEARCH_QUALIFIERS.join(` `) }, (error, issues, endpointInfo) => {
    if (error) console.log(error);
    if (!issues || issues.length === 0) {
      cb();
    } else {
      commentAndCloseIssueWithDelay(issues, 5000);
    }
  });
};
