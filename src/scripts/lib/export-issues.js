import fs from 'fs';
import moment from 'moment';
import GithubApiHelper from './github-api-helper';
import exportAsJson from './export-as-json';
import exportAsCsv from './export-as-csv';
import searchGoogleSpreadsheet from './search-google-spreadsheet';

const DIR_PATH_ROOT = "./log";

export default function(githubOwner, githubRepo, searchQualifiers, cb) {
  let timestamp = moment();
  let date = timestamp.format(`YYYYMMDD`);
  let time = timestamp.format(`HHmmss`);

  let dir = `${DIR_PATH_ROOT}/${date}`;
  let filePath = `${dir}/${time}`;

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  // available search qualifiers: https://help.github.com/articles/searching-issues-and-pull-requests/
  // https://developer.github.com/v3/search/#search-issues

  GithubApiHelper.search(`issues`, { q: searchQualifiers.join(` `) }, (error, issues, endpointInfo) => {
    let githubIssueIds = issues.map(issue => issue.number);

    searchGoogleSpreadsheet(githubIssueIds, (sheetError, matchedRows) => {
      if (sheetError) console.log(`sheetError`, sheetError);

      let report = {
        api_call_made: endpointInfo,
        timestamp: timestamp.local().format('YYYY-MM-DD HH:mm:ss'),
        count: issues.length,
        issues: issues,
        matched_spreadsheet_rows: matchedRows
      };

      exportAsJson(report, `${filePath}.json`, (jsonFileErr) => {
        if (jsonFileErr) { console.log(jsonFileErr); }

        exportAsCsv(matchedRows, `${filePath}-contact-info-only.csv`, (csvFileErr) => {
          if (csvFileErr) { console.log(csvFileErr); }

          cb();
        });
      });
    });
  });
};
