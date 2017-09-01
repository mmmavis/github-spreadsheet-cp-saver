import habitat from 'habitat';
import request from 'request';

habitat.load(`.env`);
habitat.load(`defaults.env`);

const GITHUB_API_BASE = `https://api.github.com`;
const GITHUB_OWNER = habitat.get(`GITHUB_OWNER`);
const GITHUB_REPO = habitat.get(`GITHUB_REPO`);
const GITHUB_TOKEN = habitat.get(`GITHUB_TOKEN`);

function getDataFromGithub(route, params, keyToReturn = `all`, result) {
  let endpoint = `${GITHUB_API_BASE}/${route}`;
  traverseWithPagination(endpoint, params, keyToReturn, [], (err, body = []) => {
    // console.log(body);
    let endpointInfo = { endpoint, params }
    result(err, body, endpointInfo);
  });
}

function traverseWithPagination(endpoint, params, keyToReturn, matchedItems = [], callback) {
  let combinedParams = Object.assign({
    per_page: 100,
    page: 1
  }, params);

  // console.log(`endpoint`, `${endpoint}`);
  // console.log(`combinedParams`, combinedParams);

  let options = {
    method: `GET`,
    url: `${endpoint}`,
    qs: combinedParams,
    headers: {
      Accept: `application/vnd.github.v3+json`,
      "User-Agent": `MozFest 2017 proposal`,
      Authorization: `token ${GITHUB_TOKEN}`
    },
    json: true
  };

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
        if (keyToReturn !== `all`) {
          body = body[keyToReturn];
        }

        matchedItems = matchedItems.concat(body);

        // check if there are more pages to fetch
        if ( !response.headers.link || response.headers.link.indexOf('rel="next"') < 0 ) {
          callback(null, matchedItems);
        } else {
          combinedParams.page = parseInt(combinedParams.page)+1;
          console.log(`\nNEXT combinedParams.page = ${combinedParams.page}\n`);
          traverseWithPagination(endpoint, combinedParams, keyToReturn, matchedItems, callback);
        }
      }
    }
  );
}

function postToGithub(route, content, callback) {
  let options = {
    method: `POST`,
    url: `${GITHUB_API_BASE}/${route}`,
    json: content,
    headers: {
      Accept: `application/vnd.github.v3+json`,
      "User-Agent": `MozFest 2017 proposal`,
      Authorization: `token ${GITHUB_TOKEN}`
    },
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


let Service = {
  milestones: {
    get: function(params, response) {
      getDataFromGithub(`repos/${GITHUB_OWNER}/${GITHUB_REPO}/milestones`, params, `all`, response);
    }
  },
  issues: {
    get: function(params, response) {
      getDataFromGithub(`repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, params, `all`, response);
    }
  },
  search: function(type, params, response) {
    // https://developer.github.com/v3/search
    let keyToReturn = `items`;
    getDataFromGithub(`search/${type}`, params, keyToReturn, response);
  },
  comment: function(route, issueNum, body, response) {
    postToGithub(`repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNum}/comments`, body, response);
  }
};

export default Service;
