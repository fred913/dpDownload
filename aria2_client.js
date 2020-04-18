const config = require("./config")
var WebSocketClient = require('websocket').client,

    client = new WebSocketClient(),
    conn,
    cb,
    cbmap = {}

client.on('connect', function (connection) {
    console.log('INFO: WebSocket client connected to Aria2.')
    connection.on('error', function (error) {
        console.error("ERROR: Connection Error: " + error.toString())
    });
    connection.on('close', function () {
        console.log('INFO: Connection Closed')
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
            if (typeof cbmap[data.id] === 'function') {
                var result = {
                    obj: data,
                    err: data.error ? new Error(data.error.message) : false
                }
                cbmap[data.id](result)
            }
            delete cbmap[data.id]
        }
    });

    conn = connection
    if (typeof cb === 'function') {
        cb()
    }
});

client.on('connectFailed', function (error) {
    console.error('ERROR: Client Error: ' + error.toString())
});

function connect(callback) {
    cb = callback
    client.connect(aria2_websocket_url)
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = (c === 'x') ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    });
}

function send(command, callback) {
    var id = uuid();
    if (typeof callback === 'function') {
        cbmap[id] = callback
    }

    command.jsonrpc = '2.0'
    command.id = id
    conn.sendUTF(JSON.stringify(command))
}

function download(fileURL) {
    connect(function () {
        send({
            method: 'aria2.addUri',
            params: [[fileURL]]
        }, function (result) {
            console.log(result);
        });
    });
}

exports.connect = connect
exports.send = send
exports.download = download