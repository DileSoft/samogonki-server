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

const games = {
  0: {
    id: '0',
    game_rnd: '0',
    type: 'A',
    laps: 5,
    seeds: 200,
    duration: 10,
    move_cnt: 0,
    steps_cnt: 0,
    world_id: 0,
    route_id: 0,
    express: 'Y',
    owner_id: '0',
    players: {
      0: {
        id: '0',
        name: 'player',
        turns: [],
        robot: 'N',
      },
      1: {
        id: '1',
        name: 'player2',
        turns: [],
        robot: 'N',
      }
    }
  }
};

function getPlayersString(game) {
  return Object.values(games[game].players).map(player => `${player.id};${player.name};1;1;1;1;${player.robot}`).join(';');
}

function getGameString(game) {
  return `${games[game].id};0;0;0;password;`+
  `${games[game].world_id};${games[game].route_id};${games[game].game_rnd};`+
  `${games[game].type};${games[game].laps};${games[game].seeds};`+
  `${games[game].duration};${games[game].move_cnt};${Object.values(games[game].players).length};`+
  `${games[game].steps_cnt};${games[game].express}`;
}

function getSeedsString(game) {
  return Object.values(games[game].players).map(player => player.turns[player.turns.length-1]).join(';');
}

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
    games[0].move_cnt=0;
    games[0].steps_cnt=0;
    res.send(`KDLAB;104;0;${getGameString(0)};;;;;;;${getPlayersString(0)};BITRIX`);
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
        if (parseInt(data[2]) === OG_REFRESH_PACKET) {
          console.log('go');
            res.send(`KDLAB;104;${OG_GAME_PACKET};${getGameString(0)};;;;;;;${getPlayersString(0)};${games[0].steps_cnt};2;${getSeedsString(0)};BITRIX`);
        } else if (parseInt(data[2]) === OG_SEEDS_PACKET) {
          games[0].move_cnt+=1;
          games[0].steps_cnt+=1;
          games[0].players[0].turns.push(data.slice(25).join(';'));
          games[0].players[1].turns.push([1, ...data.slice(26)].join(';'));
          console.log(getSeedsString(0));
          res.send('OK:KDLAB');
        } else if (parseInt(data[2]) === OG_CONTROL_PACKET) {
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
