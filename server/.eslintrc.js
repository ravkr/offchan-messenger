module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    // "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
        "sourceType": "module",
        "ecmaVersion": 10
    },
    "rules": {
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "MemberExpression": 0
            }
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "no-var": [
            "error"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "no-undef": [
            "error"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-trailing-spaces": [
            "error"
        ],
        "space-before-blocks": [
            "error"
        ],
        "key-spacing": [
            "error",
            { "beforeColon": false }
        ],
        "keyword-spacing": [
            "error",
            { "after": true }
        ],
        "brace-style": [
            "error",
            "1tbs",
            { "allowSingleLine": true }
        ],
        "no-multi-spaces": [
            "error"
        ],
        "space-infix-ops": [
            "error",
            { "int32Hint": false }
        ],
        "newline-per-chained-call": [
            "error",
            { "ignoreChainWithDepth": 3 }
        ],
        "eqeqeq": [
            "error",
        ],
    }
};
