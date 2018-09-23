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

export function determineBrowser(url) {
  if (config.rules) {
    // eslint-disable-next-line no-restricted-syntax
    for (const rule of config.rules) {
      if (!rule.url || !rule.browser) {
        // eslint-disable-next-line no-console
        console.warn('Incomplete rule, ignoring', rule);
        // eslint-disable-next-line no-continue
        continue;
      }

      if (new RegExp(rule.url).test(url)) {
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
