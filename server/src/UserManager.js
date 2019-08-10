const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const ipaddr = require("ipaddr.js");
const settings = require("../settings.js");

const connection = mysql.createConnection(settings.databaseCredentials);

async function loginAccount(login, password, sessionID, IPAddress) {
    // TODO: zapisywanie prób logowania
    console.log("LOGOWANIE", login, password, sessionID, IPAddress);

    let [result, fields] = await connection.promise().execute(
        "SELECT `id`,`login`,`password`,`realName` FROM `offchan`.`users` WHERE `login` = ?", [login]);
    // TODO: throw w execute wywala aż pora loginAccount?

    if (result.length === 0) {
        console.log("result:", result);
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
        let [result2] = await connection.promise().execute(
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
    // TODO: przepisać tę funkcję używając .promise()

    // TODO: zrobić z tego osobną funkcję, przyda się do innych rzeczy
    let address = ipaddr.parse(IPAddress);
    if (address instanceof ipaddr.IPv4) {
        address = address.toIPv4MappedAddress();
    }
    let IPAddressBuffer = Buffer.from(address.toByteArray());


    let hashedPassword = await bcrypt.hash(password, settings.BCRYPT_ROUNDS);
    // console.log("hashedPassword", hashedPassword);

    return await new Promise((resolve, reject) => {
        connection.execute(
            "INSERT INTO `offchan`.`users` (`login`, `password`, `realName`, `registrationIP`) VALUES (?, ?, ?, ?)",
            [login, hashedPassword, realName, IPAddressBuffer],
            (error, result) => {
                if (error) {
                    if (error.code === "ER_DUP_ENTRY") {
                        // TODO: uniwersalna klasa do "wyników" zapytań do bazy itp.
                        return resolve({
                            error: true,
                            result: "LOGIN_NOT_AVAILABLE",
                            message: "Ten login jest już zajęty"
                        });
                    }
                    return reject(error);
                }
                console.log(result);
                resolve({
                    error: false,
                    result: "SUCCESS",
                    data: {
                        userID: result.insertId
                    }
                });
            }
        );
    });
}

function closeConnections() {
    connection.end();
}

module.exports = {
    loginAccount,
    registerAccount,
    closeConnections,
};
