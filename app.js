const Discord = require("Discord.js");
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

const client = new Discord.Client();

const token = process.env.TOKEN;
const announcementChannels = ['475116538773372988'];//,'534074116399955968','388480229938823168'];

client.login(token);

var target = 0;
var lastNotification = "";

async function getWebpage(){
    switch(target){
        case 0:
            return rp('https://www.calverthall.com/page').catch((e) => console.error("\x1b[41m%s\x1b[0m",e));
        case 1:
            return fs.readFileSync('./Calvert Hall - Normal.html');
        case 2:
            return fs.readFileSync('./Calvert Hall - Snow Day.html');
        default:
            console.error("\x1b[41m%s\x1b[0m", `invalid target: ${target}`);
    }
}

async function updateNotification(){
    console.log('\nUpdate');

    let $ = cheerio.load(await getWebpage());

    let notification = $('.message').first().text().trim();

    if(notification == lastNotification) return;

    console.log('Delta');
            
    lastNotification = notification;

    if(!notification) return;

    for(let channelId of announcementChannels){
        client.channels.get(channelId).send("everyone " + notification).then(content => {
            console.log("\x1b[36m%s\x1b[0m","Notification Announced");
        }).catch(console.error);
    }
}

console.log("\x1b[44m%s\x1b[0m","Initializing...");
client.on("ready", () => {
    console.log("\x1b[44m%s\x1b[0m","Initialized");
    updateNotification();
});

client.on("message", (message) => {
    if(message.author.id == '334140752831447040' && message.content.startsWith('~')){
        target = Number(message.content.slice(1));

        message.channel.send(`Target: ${target}`).then(content => {
            console.log("\x1b[36m%s\x1b[0m",content);
        });
    }
});

client.on("error", (e) => console.error("\x1b[41m%s\x1b[0m",e));
client.on("warn", (e) => console.error("\x1b[33m%s\x1b[0m",e));
client.on("info", (e) => console.log("\x1b[37m%s\x1b[0m",e));

setInterval(updateNotification, 60000);