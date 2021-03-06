const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const ipaddr = require("ipaddr.js");
const settings = require("../settings.js");

const connectionPool = mysql.createPool(settings.databaseCredentials);

async function loginAccount(login, password, sessionID, IPAddress) {
    // TODO: zapisywanie prób logowania
    console.log("LOGOWANIE", login, password, sessionID, IPAddress);

    let [result, fields] = await connectionPool.promise().execute(
        "SELECT `id`,`login`,`password`,`realName` FROM `offchan`.`users` WHERE `login` = ?", [login]);
    // TODO: throw w execute wywala aż pora loginAccount?

    if (result.length === 0) {
        return {
            error: true,
            result: "ACCOUNT_DOES_NOT_EXIST",
            message: "Konto o takim loginie nie istnieje."
            // data: {
            // TODO: max try count etc.
            // }
        };
    }

    let ver = await bcrypt.compare(password, result[0].password.toString());
    if (!ver) {
        return {
            error: true,
            result: "PASSWORD_WRONG",
            message: "Złe hasło.",
            // data: {
            // TODO: max try count etc.
            // }
        };
    }

    try {
        let [result2] = await connectionPool.promise().execute(
            "INSERT INTO `offchan`.`sessions` (`sessionID`, `userID`) VALUES (?, ?)", [sessionID, result[0].id]);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return {
                error: true,
                result: "ALREADY_LOGGED_IN",
                message: "Już jesteś zalogowany."
                // TODO: max try count etc.
            };
        }
        throw error;
    }

    return {
        error: false,
        result: "SUCCESS",
        data: {
            userID: result[0].id,
            login: result[0].login,
            realName: result[0].realName,
        }
    };
}

async function registerAccount(login, password, realName, IPAddress) {
    // TODO: rate limiting

    // TODO: zrobić z tego osobną funkcję, przyda się do innych rzeczy
    let address = ipaddr.parse(IPAddress);
    if (address instanceof ipaddr.IPv4) {
        address = address.toIPv4MappedAddress();
    }
    let IPAddressBuffer = Buffer.from(address.toByteArray());


    let hashedPassword = await bcrypt.hash(password, settings.BCRYPT_ROUNDS);
    // console.log("hashedPassword", hashedPassword);

    try {
        let [result] = await connectionPool.promise().execute(
            "INSERT INTO `offchan`.`users` (`login`, `password`, `realName`, `registrationIP`) VALUES (?, ?, ?, ?)",
            [login, hashedPassword, realName, IPAddressBuffer]
        );

        return {
            error: false,
            result: "SUCCESS",
            data: {
                userID: result.insertId
            }
        };
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            // TODO: uniwersalna klasa do "wyników" zapytań do bazy itp.
            return {
                error: true,
                result: "LOGIN_NOT_AVAILABLE",
                message: "Ten login jest już zajęty"
            };
        }
        throw error;
    }
}

async function getSessionData(userData, ws) {
    try {
        let [result, fields] = await connectionPool.promise().execute(
            "SELECT `userID`,`lastActiveTimestamp` FROM `offchan`.`sessions` WHERE `sessionID` = ?",
            [userData.sessionID]
        );

        if (result.length === 0) {
            console.log(`Sesja ${userData.sessionID} nie istnieje.`)
            return {
                state: "NOT_LOGGED_IN"
            };
        }

        console.log(result[0]);
        let hours = (new Date() - result[0].lastActiveTimestamp)/1000/60/60
        console.log("dni sesji: ", hours/24);
        if (hours > 24) {
            console.log(`Sesja ${userData.sessionID} wygasła. Do usunięcia.`)
            // TODO: sesja wygasła - można usunąć z bazy? (lub przenieść do historii sesji)
            return {
                state: "NOT_LOGGED_IN"
            };
        }
        // TODO: odświeżanie sesji

        return {
            userID: result[0].userID,
            state: "LOGGED_IN",
        };
    } catch (error) {
        throw error;
    }
}

function closeConnections() {
    connectionPool.end();
}

module.exports = {
    loginAccount,
    registerAccount,
    getSessionData,
    closeConnections,
};
