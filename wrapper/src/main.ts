import { app, BrowserWindow } from 'electron';
import * as Url from 'url';
import * as Path from 'path';

function createWindow() {
  const window = new BrowserWindow({
    width: 90,
    height: 130,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      nativeWindowOpen: true
    }
  });

 /* window.loadURL(
    Url.format({
      pathname: Path.join(__dirname, `/client/index.html`),
      protocol: "file:",
      slashes: true
    })
  );*/

  window.loadURL('http://localhost:4200')
}

app.on('ready', createWindow);
