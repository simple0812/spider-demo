var Crawler = require('crawler');
var fs = require('fs-extra');
var moment = require('moment');
var qs = require('query-string');
var _ =  require('lodash');

let rootJson= []
/**
 * https://insights.ceicdata.com/api/nodes/databases/CN/topics?filter=%7B%7D&settings=%7B%7D&_=${moment().valueOf()}
 * https://insights.ceicdata.com/api/nodes/topics/TP128/sections?filter=%7B%7D&settings=%7B%7D&_=1595934672071

 *https://insights.ceicdata.com/api/nodes/sections/SC494/tables?filter=%7B%7D&settings=%7B%7D&_=1595934672073
 *https://insights.ceicdata.com/api/nodes/tables/TB181577/series?filter=%7B%7D&settings=%7B%7D&_=1595934672074
 */
function parseData(res) {
    let xUri = res.request.uri;
    let pathname = xUri.pathname;
    let query = xUri.query;
    let bodyJson = JSON.parse(res.body);
    let lastNode = pathname.split('/').pop();

    if (lastNode === 'topics') {
        _.forEach(bodyJson.items, item => {
            fs.appendFileSync('./out.txt', JSON.stringify(item) + '\r\n')
            c.queue(`https://insights.ceicdata.com/api/nodes/topics/${item.id}/sections?filter=%7B%7D&settings=%7B%7D&_=${moment().valueOf()}`)
        })

    } else if (lastNode === 'sections') {
        _.forEach(bodyJson.items, item => {
            fs.appendFileSync('./out.txt', JSON.stringify(item) + '\r\n')
            c.queue(`https://insights.ceicdata.com/api/nodes/sections/${item.id}/tables?filter=%7B%7D&settings=%7B%7D&_=${moment().valueOf()}`)
        })

    } else if (lastNode === 'tables') {
        _.forEach(bodyJson, item => {
            fs.appendFileSync('./out.txt', JSON.stringify(item) + '\r\n')
            c.queue(`https://insights.ceicdata.com/api/nodes/tables/${item.id}/series?filter=%7B%7D&settings=%7B%7D&_=${moment().valueOf()}`)
        })
    } else if (lastNode === 'series') {
        _.forEach(bodyJson, item => {
            fs.appendFileSync('./out.txt', JSON.stringify(item) + '\r\n')
        })
    }
    console.log(`done ${pathname} \r\n`)
}
var c = new Crawler({
    jQuery:false,
    rateLimit: 1000,
    maxConnections: 1,
    "headers": {
        "accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "same-origin",
        "cookie": "lang=zh; prod.cas.sid=s%3ATgZQuISeOkfTvWvf1IZ2XIFJFkEBK2Gc.v661349tU3FXR0LDgFrItPEMGKgq9AkkRHBwriLcOl4; Hm_lvt_9b5771e463d0599e345ad9f76084fec5=1595926628; _ga=GA1.2.29742682.1595926628; _gid=GA1.2.574327058.1595926628; wisepops=%7B%22csd%22%3A1%2C%22popups%22%3A%7B%7D%2C%22sub%22%3A0%2C%22ucrn%22%3A75%2C%22cid%22%3A%2241374%22%2C%22v%22%3A4%7D; wisepops_visits=%5B%222020-07-28T08%3A57%3A24.028Z%22%5D; __hstc=51342198.342b7e5a734b40eaa19b2b6c62fe97f3.1595926667792.1595926667792.1595926667792.1; hubspotutk=342b7e5a734b40eaa19b2b6c62fe97f3; prod.cas.force-login-form=user; mssid=s%3Aff2b129a1e7453f8ed67bdc34740970.TEvcx5bLC7XDP2wc0ptDJ6CiptJYkmdtQKv0Cv7BG1w; _ym_d=1595926802; _ym_uid=15959268021022107554; _ym_isad=2; _fw_crm_v=dbb13275-4733-4271-d9c5-7d53fa021ef5; MS-Version=4.4.3; _hjid=3aec6773-42e3-4d78-91d2-edf6e1966965; _hjIncludedInSample=1"
      },
      "referer": "https://insights.ceicdata.com/Untitled-insight/views",
    //   "referrerPolicy": "no-referrer-when-downgrade",
    callback: function(error, res, done) {
        if(error) {
            console.log('error', error)
        } else {
            try {
                parseData(res.toJSON());
            } catch(e) {
                console.log('write error', e.message)
            }
           
        }
        done();
    }
})

c.on('drain',function(err) {
    console.log('parse end')
});
 
// if you want to crawl some website with 2000ms gap between requests
c.queue(`https://insights.ceicdata.com/api/nodes/databases/CN/topics?filter=%7B%7D&settings=%7B%7D&_=${moment().valueOf()}`)
// c.queue(`https://insights.ceicdata.com/api/nodes/topics/TP151/sections?filter=%7B%7D&settings=%7B%7D&_=1595934672087`)