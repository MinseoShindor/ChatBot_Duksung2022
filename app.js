const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const path = require('path');

const db = new AWS.DynamoDB({apiVersion: "2012-08-10" });
const s3 = new AWS.S3({apiVersion: "2006-03-01"});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


let major;
fs.readfile('./major.json', 'utf8', (err, data) => {
  if(err) throw err;
  major = JSON.parse(data);
});


app.get('/keyboard', (req, res) => {
  const data = {'type': 'text'}
  res.json(data);
});

app.post('/message', (req, res) => {
  const day = new Date(); //학식 날짜
  const today = day.getDay(); //오늘
  const yoil = day.toString().slice(0,3).toUpperCase();
  const major = '';

  
  const question = req.body.userRequest.utterance; //발화
  const goMain = '잘못 들어왔어!';
  const goBack = '뒤로 가기';
  

  let data;

  if(question === '학과') {
    data = getTemplate('학과에 대해 궁금한 것이 무엇인가요?');
    

  } else if (question === goback) {
    data = getTemplate('뒤로 가기')
  }
  
  if (question === '테스트') {
    const data = {
      'version': '2.0',
      'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': '테스트'
	      }
	    }],
	    'quickReplies': [
        {
	      'label': goMain,
	      'action': 'message',
	      'messageText': goMain
	      },

        {
          'label':goBack,
          'action': 'message',
          'messageText':geBack
        },
        {
          'label':goBack,
          'action': 'message',
          'messageText':geBack
        },
        {
          'label':goBack,
          'action': 'message',
          'messageText':geBack
        },
        {
          'label':goBack,
          'action': 'message',
          'messageText':geBack
        },
        {
          'label': "오늘",
          'action': 'message',
          'messageText':'오늘'
        },
        {
          'label': "내일",
          'action': 'message',
          'messageText': '내일'
        },
        {
          'label':"어제",
          'action': 'message',
          'messageText':'어제'
        }
        
    ]
      }
    }
  }

  const parseDatePeriod = (value) => {
    const json = JSON.parse(value);
    const diff = Date.parse(json.to.date) - Date.parse(json.from.date);
    if (diff > 518400000) {
      throw new Error("One Week Exceeded");
    }
    return {
      from: `${json.from.date}T00:00:00`,
      to: `${json.to.date}T24:00:00`,
    };
  };
  
  const parseBody = (body) => {
    const json = JSON.parse(body);
    const datePeriod = parseDatePeriod(json.action.params.date_period);
  
    return {
      userId: json.userRequest.user.id,
      ...datePeriod,
    };
  };
  res.json(data);

  if (question === '학식') {
    if (yoil === 'SUN' || yoil === 'SAT') {
      data = getTemplate('오늘은 주말입니다. :)');
    } else {
      data = getTemplate( `${meal[today].day} ${meal[today].student} ${meal[today].staff}`);
    }

  } else if (question === '내일') {
    if (yoil === 'FRI' || yoil === 'SAT') {
      data = getTemplate('내일은 주말입니다. :)');
    } else {
      data = getTemplate(`${meal[today + 1].day} ${meal[today + 1].student} ${meal[today + 1].staff}`);
    }

  } else if (question === selectDay || question === goBack) {
    data = getTemplate('요일을 선택하세요.', ['월', '화', '수', '목', '금']);

  } else if (question === '상시메뉴') {
    data = getTemplate(`${meal[0].meal}`);

  } else if (question === '월' || question === '화' || question === '수' ||
            question === '목' || question === '금') {
    const dayObj = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5};
    data = getTemplate(`${meal[dayObj[question]].day} ${meal[dayObj[question]].student} ${meal[dayObj[question]].staff}`,
                        [goBack, goMain]);

  } else {
    data = getTemplate('개발 중이거나 오류입니다.\n' +
                        '개발자에게 문의해 주세요. \n' );
  } 
  
  res.json(data);
});

app.listen(3000, () => console.log('node on 3000'));


//Lambda 
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    if (body.params.type === "text") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "SUCCESS",
          value: body.params.JSON
        }),
      };
    }
  } catch (e) {}

  return {
    statusCode: 200,
    body: JSON.stringify("유효하지 않은 content입니다."),
  };
};

//DB
const putContentToDb = (content) => {
  const item = {
    UserPhoneNum: {
      S: content.UserPhoneNum,
    },

    Time: {
      S: content.time,
    },

    Name: {
      S: content.name,
    },

    Content: {
      S: content.content
    },
  };

  item.content = content.content ? { S: content.content} : {NULL : true};

  return new Promise((resolve, reject) => {
    db.putItem({
      TableName: process.env.DB_TABLE_NAME,
      Item: item,
    },
    (err, data) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(data);
    }
    );
  })
}