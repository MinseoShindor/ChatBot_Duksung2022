/*
원하는 학과 소개 페이지에서
전공 소개글(major_intro), 졸업 후 진로(after), 학과 홈페이지(homepage_url) 크롤링


*/



const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const major = require('./major/major.json');

const major_info = [];


(async() => {
try{
    const major_input = '서양화전공';
    var major_num;
    for(var i=0; i<39; i++) {
    if(major[i].major_name == major_input){
        major_num = i;
    }
}
    console.log(major_num);

    sub_url = 'https://www.duksung.ac.kr'+ major[major_num].major_url;
    console.log(sub_url);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(sub_url);
    const content = await page.content();
    const $ = cheerio.load(content);



    infoList = $('#customer_container');
    infoList.each((index, major)=>{
    if ($(major).find('br').length) {
        $(major).find('br').replaceWith(' ');
    }
      // 배우는 것에 대해
    const major_intro = $(major).find('div:nth-child(3) > div > div.inner').text().replace(/\t/g,"");
      // 졸업 이후
    const after = $(major).find('div:nth-child(8) > p').text().replace(/\t/g,"");
      // 학과 홈페이지 url
    const homepage_url = $(major).find('div:nth-child(3) > h5 > a').attr('href');

    major_info.push({ major_intro, after, homepage_url });

    return major_info;
});



    console.log(major_info);

    fs.writeFile('./major/'+major[major_num].major_name+'.json',JSON.stringify(major_info), (err) => {
    if(err) throw err;
});



    await browser.close();
}catch (err){
    console.error(err);
}
})();