const devKeys = require("./keys.dev");
const prodKeys = require("./keys.prod");

if (process.env.NODE_ENV === "production") {
    module.exports = prodKeys;
} else {
    module.exports = devKeys;
}