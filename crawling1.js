// 학교 홈페이지의 국어국문학전공 소개 페이지에서
// 배너를 통해
// 모든 학과의 이름(major_name)과 소개 페이지로 이동하는 url(major_url)을 크롤링

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const major_object = [];

(async() => {
try{

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.duksung.ac.kr/univ/majorInfo.do?miIdx=21&menuId=984');
    const content = await page.content();
    const $ = cheerio.load(content);

    const majorList = $('#top_mobile_916');
    majorList.each((idx, major) => {
        for(var i=2; i<6; i++){
        for(var j=1; j<24; j++){
            //학과 이름
            const major_name = $(major).find('div > ul > li:nth-child('+i+') > ul > li:nth-child('+j+') > a > span').text();
            // 학과 소개 페이지 url
            const major_url = $(major).find('div > ul > li:nth-child('+i+') > ul > li:nth-child('+j+') > a').attr('href');

            if(major_name !== ''){
            major_object.push({
            major_name, major_url
            });
        }
    }}
    return major_object;
    });

    fs.mkdirSync('major', (err) => {
        if(err) throw err;
    });
    
    fs.writeFile('./major/major.json',JSON.stringify(major_object), (err) => {
        if(err) throw err;
    });

    await browser.close();
    }catch (err) {
        console.error(err);
    
    }
}
)();
