require('dotenv').config();
const YANDEX_API_KEY = process.env.YANDEX_API_KEY
const token = process.env.TELEGRAM_API_KEY

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const moment = require('moment');


const bot = new TelegramBot(token, {polling: true});
const nameTeacherTransform = (name) => {
    let nameArr
    let shortName
    if (name !== null) {
        nameArr = name.trim().split(' ');
        if (nameArr.length === 3) {
            shortName = nameArr[0] + ' ' + nameArr[1].charAt(0) + '. ' + nameArr[2].charAt(0) + '.' || '';
        } else if (nameArr.length <= 2) {
            shortName = nameArr.join(' ')
        } else if (nameArr.length >= 4) {
            shortName = nameArr.join(' ')
        }
    } else {
        shortName = ''
    }
    return shortName
}
const timetableSort = (current_week) => {
    const currentDay = moment().format('d')
    const timeTransform = (ev_end, num) => moment().hours(Number(ev_end.slice(11, 13))).minutes(Number(ev_end.slice(14, 16))).add(num, 'minutes');
    let pairEnd;
    let pairStart;
    let pairStartPlus;

    const res = [];
    for (let j = 0; j < current_week.days.length; j++) {
        const item = current_week.days[j]
        for (let i = 0; i < item.pairs.length; i++) {

            if (item.pairs[i].ev_end !== null) {
                pairEnd = item.pairs[i].ev_end
            } else if (item.pairs[i].pair_time_end !== null) {
                pairEnd = item.pairs[i].pair_time_end
            } else {
                pairEnd = ''
            }
            if (item.pairs[i + 1] && item.pairs[i + 1].ev_start !== null) {
                pairStartPlus = item.pairs[i + 1].ev_start
            } else if (item.pairs[i + 1] && item.pairs[i + 1].pair_time_start !== null) {
                pairStartPlus = item.pairs[i + 1].pair_time_start
            } else {
                pairStartPlus = ''
            }

            if (item.num_day === currentDay) {
                res.push(item.pairs[i]);

                if (timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0))) {
                    res.push({
                        pereriv: true,
                        ev_start_next_pair: pairStartPlus,
                        ev_end: pairEnd,
                        pairStart: pairStart
                    });
                }
            }
        }
    }
    return res;
}
const printResultFn = (pair) => {
    return `
    Название: ${pair?.subject_name}\n
    Время: ${pair?.pairStart.slice(11, 16) + ' — ' + pair?.pairEnd.slice(11, 16)}\n
    Аудитория: ${pair?.audiences.map((item, index) => index === 0 ? `/ ${item.name}` : `${item.name}`)}\n
    Учитель: ${pair?.teachers.map((i) => nameTeacherTransform(i.name))} \n
    //////////////////////////////////////////////////////////////////
     `
}


bot.on('voice', (msg) => {
    const stream = bot.getFileStream(msg.voice.file_id);
    let chunks = [];
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => {
        const axiosConf = {
            method: 'POST',
            url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
            headers: {
                Authorization: 'Api-Key ' + YANDEX_API_KEY
            },
            data: Buffer.concat(chunks)
        }
        let voiceMessage;
        axios(axiosConf).then(response => {
            voiceMessage = response.data.result
        })
    })


});

bot.on('message', async (msg) => {
    const text = msg.text.toLowerCase();
    const chatId = msg.chat.id;

    if (text === 'расписание') {
        const fetchTimeTableConf = {
            method: 'GET',
            url: 'http://dev.bstu.local/api/account/student/timetable',
            headers: {
                Cookie: 'CABINETBSTUSESS=ia1tsgejr22hnpgc297popdse8; REMEMBERME=QXBwXEVudGl0eVxVc2VyOllXTmpRSFJsYzNRdVpHVjI6MTY1Nzg3NjkzMjo0MzJiMzJiMDNjZDQzNDFiOWM2YzEwMTNkNjI1NGVmYTM2NzFmYTYwNDgzOTgwYWU3YzZlM2FhNWUxY2RjODBj'
            }
        }
         let timeTable = await axios(fetchTimeTableConf).then(res => {
              let current_week = res.data.result.current_week
              return timetableSort(current_week)
          })

        let message = '';
        timeTable.map((item, index) => {
            message += printResultFn(item)
        })
        await bot.sendMessage(chatId, message);

    }


});

// let photo = __dirname + '/апельсин.jpg'; для загрузки файла из директории
//bot.sendMessage(chatId, requestMessage);для отправки сообщения ботом
