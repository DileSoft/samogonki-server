const express = require('express')
const SmartBuffer = require('smart-buffer').SmartBuffer;
const app = express()
app.use(express.text({type: '*/*'}))
const port = 80

const 
	OG_GAME_PACKET = 1, 	  // 1 - Пакеты, передаваемые от сервера в игру с заголовком и информацией о сделанных ходах.
	OG_CONTROL_PACKET = 2,	  // 2 - Ответы со стороны игрока о получении пакета и результатах обсчета хода.
	OG_SEEDS_PACKET = 3,	  // 3 - Ходы игроков.
	OG_COMPLETED_GAME_PACKET = 4, // 4 - Информация по состоявшейся игре.
	OG_SYS_PACKET = 5,		  // 5 - Административный тип пакетов для проверки корректности игры.
	OG_REFRESH_PACKET = 6,	  // 6 - Обновление информации о ходе для экспресс-игры
	OG_REFRESH_ANSWER_PACKET = 7, // 7 - Ответ на 6й пакет
	OG_ARCADE_GAME_PACKET = 8	  // 8 - Запуск тестовой версии с сервера

function parseRequest(request) {
  let result = request.split(';');
  const lastIndex = result.findIndex(item => item.startsWith('BITRIX'));
  if (lastIndex) {
    result = result.slice(0, lastIndex);
  }
  return result;
}

app.get('*', (req, res) => {
  console.log('get');
  console.log(req.query);
  if (req.path === '/game-on-line/default.asp') {
    res.send('KDLAB;104;0;0;0;0;0;password;0;0;0;A;10;10;200;10;2;1;Y;;;;;;;0;player;1;1;1;1;N;1;player2;1;1;1;1;N;BITRIX');
  } else {
    res.send('Hello World!')
  }
})

app.post('*', (req, res) => {
    console.log('post');
    if (req.path === '/game-on-line/default.asp') {
    //   res.send('OK:KDLAB;104;0;0;0;0;0;password;0;0;0;A;0;0;0;0;1;0;Y;;;;;;;0;player;1;1;1;1;N;BITRIX');
    //   res.send(req.body);
        const data = parseRequest(req.body);
        console.log(data);
        if (data[2] === '6') {
          console.log('go');
            res.send('KDLAB;104;1;0;0;0;0;password;0;0;0;A;11;11;200;11;2;1;Y;;;;;;;0;player;1;1;1;1;N;1;player2;1;1;1;1;N;11;2;0;Y;0;0;0;0;0;0;0;2;283#402#51#-1#504#375#50#-1;1;Y;0;0;0;0;0;0;0;2;283#402#51#-1#504#375#50#-1;BITRIX');
        } else {
          res.send('OK:KDLAB');
        }
    // res.send('NEXT_MOVE');
    } else {
      res.send('Hello World!')
    }
  })
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
