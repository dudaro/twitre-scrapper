// only add update server if it's not being run from cli
if (require.main !== module) {
  require('update-electron-app')({
    logger: require('electron-log')
  })
}

const path = require('path')
const glob = require('glob')
const {app, BrowserWindow} = require('electron')

global.sharedObj = {
  img_count: 5
}

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Trend Scrapper')

let mainWindow = null

function initialize () {
  makeSingleInstance()

  loadDemos()

  function createWindow () {
    const windowOptions = {
      width: 900,
      minWidth: 400,
      height: 700,
      title: app.getName(),
      show: false
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.setMenu(null)
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize()
