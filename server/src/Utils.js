
function parseCookie(cookieString) {
    if (typeof cookieString !== "string") {
        throw new TypeError("argument cookieString must be a string");
    }

    let obj = {};

    for (let pair of cookieString.split(/; */)) {
        let eq_idx = pair.indexOf("=");

        if (eq_idx < 0) {
            continue;
        }

        let key = pair.substr(0, eq_idx).trim();
        let value = pair.substr(++eq_idx, pair.length).trim();

        if ("\"" === value[0]) {
            value = value.slice(1, -1);
        }

        if (obj[key] === undefined) {
            try {
                obj[key] = decodeURIComponent(value);
            } catch (e) {
                obj[key] = value;
            }
        }
    }

    return obj;
}

module.exports = {
    parseCookie
};
