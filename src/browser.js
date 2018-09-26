import { spawn } from 'child_process';
import { parseString } from 'xml2js';
import jp from 'jsonpath';
import knownBrowsers from './knownBrowsers';
import config from './config';

/**
 * Lists all installed and known browser
 */
export function browser() {
  return new Promise((resolve, reject) => {
    const sp = spawn('system_profiler', ['-xml', 'SPApplicationsDataType']);

    let profile = '';

    sp.stdout.setEncoding('utf8');
    sp.stdout.on('data', (data) => {
      profile += data;
    });
    sp.stderr.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(`stderr: ${data}`);
      reject(data);
    });
    sp.stdout.on('end', () => {
      parseString(profile, (err, result) => {
        if (err) {
          console.error('error parsing XML:', err);
          reject(err);
        }
        const installedApps = jp.query(
          result,
          'plist.array[0].dict[0].array[1].dict[*].string[0]',
        );

        resolve(knownBrowsers.filter(b => installedApps.includes(b.osName)));
      });
    });
  });
}

function getOsBrowserName(name) {
  const normalizedName = name.toLowerCase();

  for (let i = 0; i < knownBrowsers.length; i += 1) {
    if (knownBrowsers[i].key.toLowerCase() === normalizedName) {
      return knownBrowsers[i].osName;
    }
  }

  return null;
}


/**
 * Cleans up unnecessary parts from the url. E.g. redirect notices as this might trigger
 * wrong rules
 * @param {string} url
 * @returns {void | string | *}
 */
export function getCleanUrl(url) {
  let cleanedUrl = url;

  // remove google url redirects
  if (cleanedUrl.startsWith('https://www.google.com/url?')) {
    // eslint-disable-next-line no-undef
    const decodedUrl = new URL(cleanedUrl);
    cleanedUrl = decodedUrl.searchParams.get('q') || cleanedUrl;
  }

  return cleanedUrl;
}


export function determineBrowser(url) {
  // clean up urls, e.g. remove url tracking part from google to no trigger any rule containing
  // the google domain
  const cleanUrl = getCleanUrl(url);

  if (config.rules) {
    // eslint-disable-next-line no-restricted-syntax
    for (const rule of config.rules) {
      if (!rule.url || !rule.browser) {
        // eslint-disable-next-line no-console
        console.warn('Incomplete rule, ignoring', rule);
        // eslint-disable-next-line no-continue
        continue;
      }

      if (new RegExp(rule.url).test(cleanUrl)) {
        const osBrowserName = getOsBrowserName(rule.browser);
        if (!osBrowserName) {
          // eslint-disable-next-line no-console
          console.warn('Browser of rule is not known:', rule);
        } else {
          return osBrowserName;
        }
      }
    }
  }

  return getOsBrowserName(config.default) || 'Safari';
}
