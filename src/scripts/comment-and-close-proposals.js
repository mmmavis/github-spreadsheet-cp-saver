import GithubApiHelper from './lib/github-api-helper';
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
  GithubApiHelper.commentOnIssue(issueNum, formatGithubComment(), (commentError) => {
    if (commentError) cb(commentError);

    console.log(`GitHub Issue #${issueNum} commented.`);
    GithubApiHelper.closeIssue(issueNum, (closeIssueError) => {
      if (closeIssueError) cb(closeIssueError);
      console.log(`GitHub Issue #${issueNum} closed.`);
      cb();
    });
  });
}

export default function(githubOwner, githubRepo, cb) {
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `no:milestone`
  ];

  GithubApiHelper.search(`issues`, { q: SEARCH_QUALIFIERS.join(` `) }, (error, issues, endpointInfo) => {
    if (error) console.log(error);
    if (!issues || issues.length === 0) cb();

    let numOfIssues = issues.length;
    let counter = 0;

    issues.forEach((issue, i, array) => {
      commentAndCloseIssue(issue.number, (commentAndCloseError) => {
        counter++;

        if (commentAndCloseError) console.log(commentAndCloseError);

        if (counter === numOfIssues) {
          cb();
        }
      });
    });
  });
};
