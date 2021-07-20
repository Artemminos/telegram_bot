const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const nodeHtmlToImage = require('node-html-to-image')
const YANDEX_API_KEY = 'AQVNyasZOCtGLqHE4g4JtDJ1VbtQYp8-LAx-LLhg'
const token = '1848733683:AAGM6epTAmsn9w46fzpvqzIB-VOdxxrajWM';
const moment = require('moment');
let timeTransform = (ev_end, num) => moment().hours(Number(ev_end.slice(11, 13))).minutes(Number(ev_end.slice(14, 16))).add(num, 'minutes');
let pairEnd;
let pairStart;
let pairStartPlus;

const bot = new TelegramBot(token, {polling: true});
const timetableSort = (timetable) => {
    if (timetable?.current_week?.days) {
        const currWeekArr = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
            now_denom: timetable.current_week.now_denom,
            group_name: timetable.group_name || timetable.teacher_name,
        };
        const sortTimeTableCurrWeek = () => {
            for (let j = 0; j < timetable.current_week.days.length; j++) {
                const item = timetable.current_week.days[j]
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


                    if (item.num_day === 1) {
                        currWeekArr.Monday.push(item.pairs[i]);


                        if (timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0))) {
                            currWeekArr.Monday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }
                    } else if (item.num_day === 2) {
                        currWeekArr.Tuesday.push(item.pairs[i]);

                        if (timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Tuesday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }

                    } else if (item.num_day === 3) {

                        currWeekArr.Wednesday.push(item.pairs[i]);

                        if (item.pairs[i + 1] && timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Wednesday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }
                    } else if (item.num_day === 4) {
                        currWeekArr.Thursday.push(item.pairs[i]);

                        if (item.pairs[i + 1] && timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Thursday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }
                    } else if (item.num_day === 5) {
                        currWeekArr.Friday.push(item.pairs[i]);
                        if (item.pairs[i + 1] && timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Friday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }

                    } else if (item.num_day === 6) {
                        currWeekArr.Saturday.push(item.pairs[i]);
                        if (item.pairs[i + 1] && timeTransform(pairEnd, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Saturday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }

                    } else if (item.num_day === 7) {
                        currWeekArr.Sunday.push(item.pairs[i]);
                        if (item.pairs[i + 1] && timeTransform(item.pairs[i].ev_end, 20).isBefore(timeTransform(pairStartPlus, 0), 'minutes')) {
                            currWeekArr.Sunday.push({
                                pereriv: true,
                                ev_start_next_pair: pairStartPlus,
                                ev_end: pairEnd,
                                pairStart: pairStart
                            });
                        }
                    }
                }
            }
        }
        sortTimeTableCurrWeek()
        const this_week = [
            {day_name: currWeekArr.Monday, day_name_ru: 'Пн', day_num: 1, item_num: 0},
            {day_name: currWeekArr.Tuesday, day_name_ru: 'Вт', day_num: 2, item_num: 1},
            {day_name: currWeekArr.Wednesday, day_name_ru: 'Ср', day_num: 3, item_num: 2},
            {day_name: currWeekArr.Thursday, day_name_ru: 'Чт', day_num: 4, item_num: 3},
            {day_name: currWeekArr.Friday, day_name_ru: 'Пт', day_num: 5, item_num: 4},
            {day_name: currWeekArr.Saturday, day_name_ru: 'Сб', day_num: 6, item_num: 5},
            {day_name: currWeekArr.Sunday, day_name_ru: 'Вс', day_num: 7, item_num: 6},
        ]
        return [this_week, currWeekArr.group_name, currWeekArr.now_denom]
    } else {

        return [[{day_name: [], day_name_ru: 'Пн', day_num: 1, item_num: 0},
            {day_name: [], day_name_ru: 'Вт', day_num: 2, item_num: 1},
            {day_name: [], day_name_ru: 'Ср', day_num: 3, item_num: 2},
            {day_name: [], day_name_ru: 'Чт', day_num: 4, item_num: 3},
            {day_name: [], day_name_ru: 'Пт', day_num: 5, item_num: 4},
            {day_name: [], day_name_ru: 'Сб', day_num: 6, item_num: 5},
            {day_name: [], day_name_ru: 'Вс', day_num: 7, item_num: 6},],
            typeof (timetable.group_name) === 'string' ? timetable.group_name : 0,
            0
        ]

    }


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
    const chatId = msg.chat.id;
    const fetchTimeTableConf = {
        method: 'GET',
        url: 'http://dev.bstu.local/api/account/student/timetable',
        headers: {
            Cookie: 'CABINETBSTUSESS=ia1tsgejr22hnpgc297popdse8; REMEMBERME=QXBwXEVudGl0eVxVc2VyOllXTmpRSFJsYzNRdVpHVjI6MTY1Nzg3NjkzMjo0MzJiMzJiMDNjZDQzNDFiOWM2YzEwMTNkNjI1NGVmYTM2NzFmYTYwNDgzOTgwYWU3YzZlM2FhNWUxY2RjODBj'
        }
    }
    let timetableData = await axios(fetchTimeTableConf).then(res => {
        let timetable = {};
        timetable.current_week = res.data.result.current_week
        return timetableSort(timetable)
    })


    const [timetable, ...rest] = timetableData
    let monday = timetable[0];


    monday.day_name.map((elem, index) => {

        let requestMessage = `
        start:${elem.ev_start}
        end:${elem.ev_end}
        teachers:${elem?.teachers.map(e => e?.name)}
        audiences:${elem?.audiences.map(e => e?.name)}
        name:${elem.subject_name}
        `
        nodeHtmlToImage({
            output: './image.png',
            html: `<html>
    <head>
      <style>
        body {
          width: 500px;
          height: 500px;
        }
      </style>
    </head>
    <body>
   {{name}}
 </body>
  </html>
  `,
            content: {name: 5}
        })
            .then((data) => {
                bot.sendPhoto(chatId, data, {caption: "I'm a cool bot!"});
            })


        //bot.sendMessage(chatId, requestMessage);
    })


    // if (msg.text.toLowerCase() === 'покажи рассписание') {}

});

// let photo = __dirname + '/апельсин.jpg'; для загрузки файла из директории
//bot.sendMessage(chatId, requestMessage);для отправки сообщения ботом
