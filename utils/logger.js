var log4js = require("log4js");
var fs = require("fs");
var path = require("path");
const LOG_DIR = path.resolve(__dirname, "../logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

log4js.configure({
  appenders: {
    normal: {
      type: "file",
      filename: path.join(LOG_DIR, "/normal.log"),
      maxLogSize: 500 * 1024 * 1024,
    },
    console: {
      type: "console",
    },
  },
  categories: {
    default: { appenders: ["normal", "console"], level: "debug" },
    console: { appenders: ["console"], level: "debug" },
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

// 当不传参或找不到对应 category时，默认使用default的配置
var defaultLogger = log4js.getLogger();
module.exports = defaultLogger;
