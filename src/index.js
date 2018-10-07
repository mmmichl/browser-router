import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import { transports, info, warn, error, verbose } from 'electron-log';
import { listBrowser, determineBrowser, getCleanUrl } from './browser';
import config from './config';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

if (config.debug) {
  transports.file.level = 'info';
}

// Hide dock icon. Also prevents Browserosaurus from appearing in cmd-tab.
app.dock.hide();

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  app.setAsDefaultProtocolClient('http');

  if (process.argv.find(e => e === '-l')) {
    try {
      const foundBrowser = await listBrowser();
      warn('Following browsers were found on this system:');
      warn(foundBrowser.map(b => ` ${b.key}`).join('\n'));
    } catch (e) {
      error('error fetching browsers', e);
    }
    app.quit();
  }

  // if the application was not started with the intention to open a url, quit after one second
  setTimeout(() => app.quit(), 3000);
});

/**
 * Event: Open URL
 *
 * When a URL is sent to Browserosaurus (as it is default browser), send it to
 * the picker.
 * @param {string} url
 */
app.on('open-url', (event, url) => {
  verbose('open-url, not sanitized', url);
  event.preventDefault();

  const browser = determineBrowser(url);
  const cleanUrl = getCleanUrl(url);

  info('open browser', browser, 'with URL', cleanUrl);

  // spawn('sh', [
  //   '-c',
  //   `open ${cleanUrl} -a "${browser}"`,
  // ]);
  spawn('open', [
    cleanUrl,
    '-a',
    browser,
  ]);

  setTimeout(() => app.quit(), 100);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
