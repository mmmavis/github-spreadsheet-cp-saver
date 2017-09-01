import GithubApiHelper from './lib/github-api-helper';

export default function(githubOwner, githubRepo, cb) {
  const SEARCH_QUALIFIERS = [
    `repo:${githubOwner}/${githubRepo}`,
    `is:open`,
    `no:milestone`
  ];

  GithubApiHelper.search(`issues`, { q: SEARCH_QUALIFIERS.join(` `) }, (error, issues, endpointInfo) => {
    console.log(issues.length);
    cb();
  });
};
