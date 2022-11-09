/*
원하는 학과 홈페이지에서 배너를 통해
학과소개(introduction), 위치 및 연락처(loc_tel), 교수 정보(professor) 페이지로 이동하는 url 크롤링
위의 정보 크롤링

*/


const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');


const major_input = '서양화전공';

const major = require('./b/'+major_input+'.json');



(async() => {
  try{

    for(var i=0; i<4; i++){
      if(i===0) url = major[0].homepage_url;
      else if(i===1){ // 학과 소개
        url = 'https://www.duksung.ac.kr'+ major[1].introduction;
      }
      else if(i===2){ // 위치 및 연락처
        url = 'https://www.duksung.ac.kr'+ major[1].loc_tel;
      }
      else {  // 교수 정보
        url = 'https://www.duksung.ac.kr'+ major[1].professor;
      }





    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    const $ = cheerio.load(content);


    if(i===0){
      urlList = $('#lnb-mobile');
      urlList.each((idx, url) => {

        const introduction = $(url).find('#top_mobile_1402 > a').attr('href');
        const loc_tel = $(url).find('#top_mobile_1402 > div > ul > li:nth-child(4) > a').attr('href');
        const professor = $(url).find('#top_mobile_1403 > div > ul > li > a').attr('href');
      major.push({introduction, loc_tel, professor });

      return major;
    });
    }
    else if(i===1){
    infoList = $('#contents');
    infoList.each((idx, info) => {
        const major_introduction = $(info).find('#result > div > div > p').text().replace(/\t/g,"");
        major.push({major_introduction});
        return major;
    });
    }
    else if(i===2){
    infoList = $('#form');
    infoList.each((idx, info) => {
        const location = $(info).find('#result > div > div > ul > li:nth-child(1)').text();
        const tel = $(info).find('#result > div > div > ul > li:nth-child(2)').text().replace(/연락처/g,"").trim();
        major.push({location,tel});
        return major;
    });

    }

    else  {  // 교수 정보
    infoList = $('#customer_container');
    const professor_info = [];
    infoList.each((idx, info) => {
        for(var p=1; p<$('div.mb30.teacher-wrap > div > div > div > div.col-sm-8 > button').length+1; p++){

        const prof_name = $(info).find('div.mb30.teacher-wrap > div > div:nth-child('+p+') > div > div > ul > li:nth-child(1)').text().replace(/명예교수 :|교수 :|조교수 :|부교수 :/g,"").trim();
        const prof = $(info).find('div.mb30.teacher-wrap > div > div:nth-child('+p+') > div > div > ul > li:nth-child(1)').text().replace(prof_name,"").replace(/:/g,"").trim();
        const prof_tel = $(info).find('div > div > div:nth-child('+p+') > div > div > ul > li:nth-child(2)').text().replace(/구내전화 : |:/g,"").trim();
        const prof_major = $(info).find('div > div > div:nth-child('+p+') > div > div > ul > li:nth-child(4)').text().replace(/전공 및 연구분야 : |:/g,"").replace(/\n/g," ");

        professor_info.push({prof, prof_name, prof_tel, prof_major});
    }
    major.push(professor_info);
        return major;
    })
    }




    fs.writeFile('./major/'+major_input+'.json',JSON.stringify(major), (err) => {
    if(err) throw err;

    });
    await browser.close();

}
console.log(major);
}catch (err){console.error(err);}

})();