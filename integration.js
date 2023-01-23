'use strict';

const request = require('postman-request');
const config = require('./config/config');
const async = require('async');
const fs = require('fs');

let Logger;
let requestDefault;

/**
 *
 * @param entities
 * @param options
 * @param cb
 */
function doLookup(entities, options, cb) {
  let lookupResults = [];
  let tasks = [];

  Logger.trace(entities);

  entities.forEach((entity) => {
    const requestOptions = {
      method: 'POST',
      uri: `${options.url}/api/v2/search/hash`,
      body: 'hash=' + entity.value,
      headers: {
        'api-key': options.apiKey,
        'user-agent': 'Falcon Sandbox',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true
    };

    Logger.debug({ uri: requestOptions }, 'Request URI');

    tasks.push(function (done) {
      requestDefault(requestOptions, function (error, res, body) {
        if (error) {
          done({
            error,
            entity: entity.value,
            detail: 'HTTP Request Error'
          });
          return;
        }

        if (res.statusCode === 200) {
          if (!body || !Array.isArray(body) || body.length === 0) {
            // this is a miss
            return done(null, {
              entity,
              body: null
            });
          } else {
            return done(null, {
              entity: entity,
              body: body
            });
          }
        }

        if (res.statusCode === 429) {
          return done({
            detail: 'Reached API Lookup Limit',
            body
          });
        }

        // Non 200 status code
        return done({
          httpStatus: res.statusCode,
          body: body,
          detail: 'Unexpected Non 200 HTTP Status Code',
          entity: entity.value
        });
      });
    });
  });

  async.parallelLimit(tasks, 10, (err, results) => {
    if (err) {
      cb(err);
      return;
    }

    Logger.trace({results}, 'Raw Lookup Results');

    results.forEach((result) => {
      if (result.body === null) {
        // cache as a miss since body is null
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else {
        let validResults = [];
        let maxScore = -1;
        let maxScan = null;

        // find the max score out of all our results
        for (let i = 0; i < result.body.length; i++) {
          const scan = result.body[i];

          if (scan.job_id !== null) {
            if (scan.threat_score > maxScore) {
              maxScore = scan.threat_score;
              maxScan = scan;
            }

            // add a count property
            scan.__count = i + 1;

            validResults.push(scan);
          }
        }

        if (maxScore < options.minScore || validResults.length === 0) {
          lookupResults.push({
            entity: result.entity,
            data: null
          });
        } else {
          lookupResults.push({
            entity: result.entity,
            data: {
              summary: getTags(maxScan, validResults.length),
              details: validResults
            }
          });
        }
      }
    });

    Logger.trace({ lookupResults: lookupResults }, 'Lookup Results');

    cb(null, lookupResults);
  });
}

function getTags(scan, numScans) {
  let tags = [`Max Threat Score: ${scan.threat_score}`];

  const verdict = scan.verdict ? scan.verdict : 'no verdict';
  const family = scan.vx_family ? scan.vx_family : 'no family';

  tags.push(`${verdict}: ${family}`);

  if (numScans > 1) {
    tags.push(`+${numScans - 1} more scans`);
  }
  return tags;
}

function startup(logger) {
  Logger = logger;

  let defaults = {};

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    defaults.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    defaults.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    defaults.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    defaults.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    defaults.proxy = config.request.proxy;
  }

  requestDefault = request.defaults(defaults);
}

function validateOptions(userOptions, cb) {
  let errors = [];
  if (
    typeof userOptions.apiKey.value !== 'string' ||
    (typeof userOptions.apiKey.value === 'string' && userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: 'apiKey',
      message: 'You must provide a valid API key'
    });
  }
  cb(null, errors);
}

module.exports = {
  doLookup: doLookup,
  validateOptions: validateOptions,
  startup: startup
};
