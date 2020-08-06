var log4js = require("log4js");
var fs = require("fs");
var path = require("path");
const LOG_DIR = path.resolve(__dirname, '../logs')
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}


log4js.configure({
  appenders: {
    normal: {
      type: "file",
      filename: LOG_DIR + "/normal.log",
      maxLogSize: 500 * 1024 * 1024,
    },
    access: {
      type: "console",
    },
  },
  categories: { 
    default: { appenders: ["normal"], level: "debug" },
    access: { appenders: ["access"], level: "debug" } 
  },
});

function subErrorStack(error) {
  error = error || "";
  //Error SyntaxError SyntaxError RangeError TypeError URIError EvalError
  if (
    typeof error === "object" &&
    error.constructor.name.indexOf("Error") > -1 &&
    error.stack
  ) {
    return error.stack.split(/\n/).slice(0, 2).join("\n");
  } else if (typeof error === "string") {
    return error;
  } else {
    var ret = error.toString();
    try {
      ret = JSON.stringify(error);
    } catch (e) {}

    return ret;
  }
}

var normal = log4js.getLogger("normal");

module.exports = normal;