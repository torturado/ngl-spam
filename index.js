//require library to make web requests
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const querystring = require('querystring');

const url = "https://ngl.link/api/submit";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Username: ', (username) => {
  rl.question('Do you want to use random questions? (y/n) ', (answer) => {
    if(answer === 'y') {
      fs.readFile('questions.txt', 'utf8', (err, data) => {
        if(err) {
          console.log(err);
        } else {
          let questions = data.split('\n');
          rl.question('How many times do you want to send the question? ', (repeat_count) => {
            sendRequests(username, questions, Number(repeat_count));
          });
        }
      });
    } else {
      rl.question('Question: ', (question) => {
        rl.question('How many times do you want to send the question? ', (repeat_count) => {
          sendRequests(username, [question], Number(repeat_count));
        });
      });
    }
  });
});

function sendRequests(username, questions, repeat_count) {
  let headers = {
    "Host": "ngl.link",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": "https://ngl.link",
    "DNT": "1",
    "Connection": "keep-alive",
    "Referer": `https://ngl.link/${username}`,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Sec-GPC": "1",
    "TE": "trailers"
  };

  questions = shuffleArray(questions);

  let sentQuestionsCount = 0;
  let requests = [];
  
  for(let i = 0; i < repeat_count; i++) {
      let current_question = questions[sentQuestionsCount % questions.length];
      let question = querystring.escape(current_question);
      let payload = `username=${username}&question=${question}&deviceId=674c9c2d-de11-4dae-be83-5be6201e9a7a&gameSlug=&referrer=`;

      requests.push(sendRequest(payload, headers, current_question));
      sentQuestionsCount++;
  }

  Promise.all(requests)
      .then(() => rl.close())
      .catch(error => console.log(error));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function sendRequest(payload, headers, current_question) {
  try {
    let response = await axios.post(url, payload, {
      headers: headers
    });

    if(response.status === 200) {
      console.log('----------------------------------------');
      console.log('Request Successful! Response Code: 200');
      console.log('Response Data:', response.data);
      console.log('Question sent:', current_question);
      console.log('----------------------------------------');
    }
  } catch (error) {
    console.log(error);
  }
}