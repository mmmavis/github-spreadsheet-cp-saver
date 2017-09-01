import exportIssues from './lib/export-issues';

export default function(githubOwner, githubRepo, cb) {
  // available search qualifiers: https://help.github.com/articles/searching-issues-and-pull-requests/
  // https://developer.github.com/v3/search/#search-issues

  // Standard Rejection - Open Issues with No Milestone & No "[Production] Flagged" Label
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `no:milestone`,
    `-label:"[Production] Flagged"`,
  ]

  exportIssues(githubOwner, githubRepo, SEARCH_QUALIFIERS, () => {
    cb();
  });
};
