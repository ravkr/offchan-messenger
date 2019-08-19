const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const crypto = require("crypto");
const Utils = require("./src/Utils.js");
const UserManager = require("./src/UserManager.js");

let server = http.createServer(function (request, response) {

    let filePath = request.url.replace(/(\/)\/+/g, "$1");
    filePath = "../www/public" + filePath;
    if (filePath === "../www/public/") {
        filePath = "../www/public/index.html";
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        ".html": "text/html;charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpg",
        ".gif": "image/gif",
        ".wav": "audio/wav",
        ".mp4": "video/mp4",
        ".woff": "application/font-woff",
        ".ttf": "application/font-ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".otf": "application/font-otf",
        ".svg": "image/svg+xml"
    };

    let contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === "ENOENT") {
                fs.readFile("../www/public/404.html", (error, content) => {
                    response.writeHead(404, { "Content-Type": mimeTypes[".html"] });
                    if (error) {
                        content = "Error 404. Page not found.";
                    }
                    response.end(content, "utf-8");
                });
            } else {
                response.writeHead(500);
                response.end("Sorry, check with the site admin for error: " + error.code + " ...\n");
            }
        } else {
            response.writeHead(200, {
                "Content-Type": contentType,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            });
            response.end(content, "utf-8");
        }
    });
});


const wss = new WebSocket.Server({ server });
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on("headers", function connection(headers, request) {
    let oldCookies = Utils.parseCookie(request.headers["cookie"] || "");
    let base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    // TODO: może jakaś klasa do aktualnej sesji?
    request.userData = {
        state: "NOT_LOGGED_IN", // TODO: magic number
    };

    // let sessionID;
    if (base64Regex.test(oldCookies["sid"])) {
        request.userData.sessionID = oldCookies["sid"];
        request.userData.state = "REQUEST_SESSION_DATA"
    } else {
        // TODO: czy dodanie callbacku do generowania randomBytes jest możliwe? (obecnie jest to blokujące)
        request.userData.sessionID = crypto.randomBytes(18).toString("base64");
    }

    // TODO: na produkcji ma być dodatkowo "; Secure"
    // TODO: czas trwania sesji do ustawień
    let cookie = `Set-Cookie: sid=${request.userData.sessionID}; Max-Age=600; HttpOnly`;
    headers.push(cookie);

});

wss.on("connection", function connection(ws, request) {
    let IPAddress = ws._socket.remoteAddress;
    console.log(`[${Utils.getDateString()}] Websocket connection; ${IPAddress}; sessionID: ${request.userData.sessionID}`);
    // TODO: obsługa IP jeśli używamy reverse proxy
    // const ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];

    if (request.userData.state === "REQUEST_SESSION_DATA") {
        request.userData.state = "LOADING_SESSION_DATA";
        UserManager.getSessionData(request.userData).then((data)=> {
            request.userData = {
                ...request.userData,
                ...data
            }

            if (data.state === "LOGGED_IN") {
                let obj = {
                    type: "login",
                    userID: data.userID
                };
                ws.send(JSON.stringify(obj));
            }
        }).catch((err) => {
            // TODO: obsługa błędów
            console.log("getSessionData error!", err);
        });
    }

    ws.on("message", function incoming(message) {
        let json;
        try {
            json = JSON.parse(message);
        } catch (e) {
            // ws.close();
            console.log("onMessage error: %s", message);
            return;
        }
        console.log("onMessage:", json);

        switch (json.action) {
            case "login":
                UserManager.loginAccount(json.login, json.password, request.userData.sessionID, IPAddress).then((data)=> {
                    console.log("login:", data);
                    ws.send(JSON.stringify(data));
                }).catch((err) => {
                    // TODO: obsługa błędów
                    console.log("login error!", err);
                });
                break;
            case "register":
                UserManager.registerAccount(json.login, json.password, json.realName, IPAddress).then((data)=> {
                    console.log("register:", data);
                }).catch((err) => {
                    // TODO: obsługa błędów
                    console.log("register error!", err);
                });
                break;
        }
    });

    ws.on("close", () => {
        console.log(`[${Utils.getDateString()}] Websocket disconnected; IP: ${IPAddress}; sessionID: ${request.userData.sessionID}`);
    });
});

server.listen(3366);
console.log("Server running at http://127.0.0.1:3366/");
