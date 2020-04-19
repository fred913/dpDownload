const { app, BrowserWindow, Menu } = require('electron')
const { spawn, exec } = require('child_process')
const os = require('os')
const aria2_client = require("./aria2_client")
var sys_type = null

function fatelErrorHandle(err) {
    console.error(err.stack)
    // console.error("If this program isn't working at the second time, please try `./dpdownload --close-aria2c`.")
    process.exit(1)
}

process.on('uncaughtException', fatelErrorHandle)

process.on('unhandledRejection', fatelErrorHandle)

if (process.argv.includes("--close-aria2c")) {
    console.warn("Detected --close-aria2c. This will just close aria2c process, and will not run the application.")
    try {
        var fs = require("fs")
        var aria2c_pid = fs.readFileSync("./aria2c.pid", "utf8")
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
    var kill = spawn('taskkill', ["/pid", aria2c_pid])
}

const devMode = process.argv.includes("--dev")

console.log(process.argv)
console.log(devMode)

if (os.type() == 'Windows_NT') {
    sys_type = "win32"
} else if (os.type() == 'Darwin') {
    sys_type = "osx"
} else if (os.type() == 'Linux') {
    sys_type = "linux"
} else {
    //不支持提示
}

function runAria2cRPC() {
    var cmd = spawn("./aria2c", ["--conf-path=./aria2.conf"])
    console.log(cmd)
    return cmd.pid
}
var aria2c_pid = runAria2cRPC()
var fs = require("fs");
fs.writeFile("./aria2c.pid", aria2c_pid, "utf8", function (err) {
    if (!err) {
        console.log("aria2c.pid saved!");
    }
})


function createWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    const template = [
        {
            label: '编辑',
            submenu: [
                {
                    label: '撤销',
                    role: 'undo',
                    accelerator: "CmdorCtrl+Z"
                },
                {
                    label: '重做',
                    role: 'redo',
                    accelerator: "CmdorCtrl+Y"
                }, {
                    label: '剪切',
                    role: 'copy',
                    accelerator: "CmdorCtrl+X"
                },
                {
                    label: '复制',
                    role: 'copy',
                    accelerator: "CmdorCtrl+C"
                },
                {
                    label: '粘贴',
                    role: 'paste',
                    accelerator: "CmdorCtrl+V"
                }
            ]
        }
    ]

    const customMenu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(customMenu)
    win.setMenu(customMenu)

    // 并且为你的应用加载index.html
    // win.loadFile('index.html')
    win.loadURL("https://aria2c.com/")

    // 打开开发者工具
    if (devMode) {
        win.webContents.openDevTools()
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on("quit", () => {
    var kill = spawn('taskkill', ["/pid", aria2c_pid]);
})

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。

