# Browser Router

Open your desired browser when clicking on a link based on the URL. This is a desktop application which registers itself 
as the default browser. When clicking on a link in an application - e.g. your email program - you can specify rules 
expressed in JavaScript regular expressions to decide based on the URL which browser should be opened.

This macOS appication is open-source and based on Electron.

## Installation

Pick the latest [release](https://github.com/mmmichl/browser-router/releases) and install the package. 

After installation you need to run `Browser Router` once manually. You will be asked if the application should be 
registered as the default browser. Confirm this to start using `Browser Router`.

## Configuration

This is unfortunately still a bit complicated. In your Finder select "Browser Router" in "Applications" folder. 
Right click and select "Show Package Contents". 

Navigate to `Contents/Resources/app/src`. Open `config.json` and edit the content or add a new entry.

`default`: if no rules are matched, this browser is used.

`url`: should be a JavaScript RegExp expression to match an URL. You can test your regular expression e.g. online here https://www.regexpal.com/

### Recognized Browsers
| Keyword       | Browser              |
|---------------|----------------------|
| chrome        | Google Chrome        |
| chrome-canary | Google Chrome Canary |
| chromium      | Chromium             |
| firefox       | Firefox              |
| opera         | Opera                |
| safari        | Safari               |
| vivaldi       | Vivaldi              | 

If your browser is missing, please create a new issue.
