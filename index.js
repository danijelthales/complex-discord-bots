require("dotenv").config()
const Discord = require("discord.js")


const replaceString = require('replace-string');
const https = require('follow-redirects').https;
const redis = require("redis");
let redisClient = null;

var fs = require('fs');

const clientNecDao = new Discord.Client();
clientNecDao.login(process.env.BOT_TOKEN_NEC_DAO);

const puppeteer = require('puppeteer');
var daoHolders = 138;

setInterval(function () {

    clientNecDao.guilds.cache.forEach(function (value, key) {
        try {
            value.members.cache.get("779720047769813013").setNickname("necDAO=" + daoHolders);
            value.members.cache.get("779720047769813013").user.setActivity("locked=$" + getNumberLabel(DAObalance) + " NEC=" + getNumberLabel(DAONecBalance), {type: 'PLAYING'});
        } catch (e) {
            console.log(e);
        }
    });

}, 60 * 1000);


async function getDaoHolders() {
    try {
        console.log("Fetching Dao Holders");
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 926});
        await page.goto("https://alchemy.daostack.io/dao/0xe56b4d8d42b1c9ea7dda8a6950e3699755943de7/members/", {waitUntil: 'networkidle2'});
        await delay(25000);
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(5000);
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await delay(5000);
        /** @type {string[]} */
        var prices = await page.evaluate(() => {
            var div = document.querySelectorAll('.A9766RuJrZ1KGQeSF-LoT');

            var prices = []
            div.forEach(element => {
                prices.push(element.textContent);
            });

            return prices
        })
        if (prices.length > 0) {
            daoHolders = prices.length;
        }
        browser.close()
    } catch (e) {
        console.log("Error happened on getting data from barnbridge.");
        console.log(e);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

setTimeout(getDaoHolders, 60 * 1000 * 1);
setInterval(getDaoHolders, 60 * 1000 * 60 * 5);

function getNumberLabel(labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? Math.round(Math.abs(Number(labelValue)) / 1.0e+9) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(labelValue)) >= 1.0e+6

            ? Math.round(Math.abs(Number(labelValue)) / 1.0e+6) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(labelValue)) >= 1.0e+3

                ? Math.round(Math.abs(Number(labelValue)) / 1.0e+3) + "K"

                : Math.abs(Number(labelValue));

}
