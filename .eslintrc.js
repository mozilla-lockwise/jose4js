module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
      "ecmaVersion": 2017
    },
    "rules": {
        "indent": [
            "error",
            2,
            {
              "SwitchCase": 1,
              "VariableDeclarator": {
                "var": 2,
                "let": 2,
                "const": 3
              }
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
