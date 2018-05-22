require('isomorphic-fetch');

const {resolve} = require('path');
const {existsSync, readFileSync} = require('fs-extra');
const {execSync} = require('child_process');

const repo = 'polaris-react';
const sha = process.env.CIRCLE_SHA1; // eslint-disable-line no-process-env
const pullRequestURL =
  process.env.CIRCLE_PULL_REQUEST && process.env.CIRCLE_PULL_REQUEST.split('/'); // eslint-disable-line no-process-env
const pullRequestID = pullRequestURL
  ? pullRequestURL[pullRequestURL.length - 1]
  : undefined;

const postWebpackReportURL = `https://shrink-ray.redhiocloud.com/repos/${repo}/commits/${sha}/reports`;

const build = resolve(__dirname, '..', 'shrink-ray-build/build');
const report = resolve(build, 'bundle-analysis', 'report.html');

process.on('unhandledRejection', (reason) => {
  throw reason;
});

if (sha) {
  setupShrinkRay();
} else {
  console.log(
    'sha is not available, building bundle without pinging shrink-ray',
  );
  buildPackages(false);
}

function buildPackages(includeReport) {
  execSync('yarn run webpack --config shrink-ray-build/webpack.config.js', {
    stdio: 'inherit',
  });
}

function setupShrinkRay() {
  console.log('[shrink-ray] Running shrink-ray prebuild script...');
  sendCommitStatus('pending')
    .then((response) => {
      console.log(`[shrink-ray] status: ${response.status}`);
      console.log(`[shrink-ray] statusText: ${response.statusText}`);
      console.log('[shrink-ray] shrink-ray prebuild script completed.');
      buildPackages(true);
      return postReportToShrinkRay();
    })
    .then((response) => {
      console.log(`[shrink-ray] Status: ${response.status}`);
      console.log(`[shrink-ray] Status text: ${response.statusText}`);
      return response.text();
    })
    .then((responseText) => {
      console.log(`[shrink-ray] Response text: ${responseText}`);
      console.log('[shrink-ray] Postbuild script completed.');
      return true;
    })
    .catch((error) => {
      console.log('ERROR: ', error);

      // eslint-disable-next-line promise/no-nesting
      sendCommitStatus('error')
        .then(() => {
          throw error;
        })
        .catch(() => {
          throw error;
        });
    });
}

function sendCommitStatus(state) {
  // prettier-ignore
  const statusUrl = `https://shrink-ray.redhiocloud.com/repos/${repo}/commits/${sha}/status/${state}`;
  console.log(`[shrink-ray] POST ${statusUrl}`);
  return fetch(statusUrl, {method: 'POST'});
}

function postReportToShrinkRay() {
  console.log('[shrink-ray] Running shrink-ray postbuild script...');
  console.log(`[shrink-ray] POST ${postWebpackReportURL}`);

  if (!existsSync(report)) {
    sendCommitStatus('error');
    throw new Error('webpack-bundle-analyzer report not found.');
  }

  // fetch latest in BuildKite pipeline
  execSync('git fetch origin master');

  const masterSha = execSync('git merge-base HEAD origin/master', {
    encoding: 'utf8',
  }).trim();

  console.log('[shrink-ray] pullRequestID: ', pullRequestID);
  console.log('[shrink-ray] masterSha: ', masterSha);

  return fetch(postWebpackReportURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report: readFileSync(report, 'utf8'),
      pr_id: pullRequestID, // eslint-disable-line camelcase
      masterSha,
    }),
  });
}
