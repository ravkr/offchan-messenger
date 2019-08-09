const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const ipaddr = require("ipaddr.js");
const settings = require("../settings.js");

const connection = mysql.createConnection(settings.databaseCredentials);

async function registerAccount(login, password, realName, IPAddress) {
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
    registerAccount,
    closeConnections,
};
