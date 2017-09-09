import exportIssues from './lib/export-issues';

export default function(githubOwner, githubRepo, cb) {
  // available search qualifiers: https://help.github.com/articles/searching-issues-and-pull-requests/
  // https://developer.github.com/v3/search/#search-issues

  // 'Gold Star' Rejection Spreadsheet - Open Issues with No Milestone & "[Production] Flagged" Label
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `no:milestone`,
    `label:"[Production] Flagged"`,
    `author:mozfest-bot`
  ];

  exportIssues(githubOwner, githubRepo, SEARCH_QUALIFIERS, () => {
    cb();
  });
};
