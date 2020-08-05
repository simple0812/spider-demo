var webdriver = require("selenium-webdriver");
var By = webdriver.By;
var until = webdriver.until;

var utils = require("./utils");

async function login() {
  var driver = new webdriver.Builder().forBrowser("chrome").build();

  await driver.get("http://39.98.43.115:8085/#/personalCenter/myTraining");

  await utils.delay(2000);

  driver.findElement(By.id("username")).sendKeys("admin");
  driver.findElement(By.id("password")).sendKeys("1qaz12@WSX");
  driver.findElement(By.className("btn-login")).click();

  await driver.wait(async () => {
    let temp = await driver.getTitle();
    return temp === "我的培训";
  }, 10000);

  let xUrl = await driver.getCurrentUrl();
  let xTitle = await driver.getTitle();

  await utils.delay(2000);

  let trs = await driver.findElement(By.className('ant-table-row'));

  console.log(trs);

}

login();
