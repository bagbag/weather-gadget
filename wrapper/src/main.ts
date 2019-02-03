import { app, BrowserWindow } from 'electron';
import * as Url from 'url';
import * as Path from 'path';

function createWindow() {
  const window = new BrowserWindow({ width: 60, height: 80, titleBarStyle: 'hidden', autoHideMenuBar: true })
  window.loadURL(
    Url.format({
      pathname: Path.join(__dirname, `/client/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
}

app.on('ready', createWindow);
