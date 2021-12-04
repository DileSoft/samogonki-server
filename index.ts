import * as express from 'express';
const app = express()
app.use(express.text({type: '*/*'}))
const port = 80

interface GamePacketData {
  Version: 104,
  TType: OG_GAME_PACKET,
  ID: 0,
  LID: 0,
  GAME_OWNER_UID: 0,
  OWNER_UID: 0,
  PASSWORD: '',
  KD_WORLD_ID: 0,
  KD_ROUTE_ID: 0,
  GAME_RND: 0,
  GTYPE: 'A',
  LAPS: 0,
  SEEDS: 0,
  DURATION: 0,
  MOVE_CNT: 0,
  PLAYERS_CNT: 0,
  STEPS_CNT: 0,
  EXPRESS: 'Y',
  URL_POST: '',
  URL_POST_PORT: '',
  URL_POST_PATH: '',
  URL_RETURN: '',
  PLAYERS: [],
  STEPS: [],
}

const 
	OG_GAME_PACKET = 1, 	  // 1 - Пакеты, передаваемые от сервера в игру с заголовком и информацией о сделанных ходах.
	OG_CONTROL_PACKET = 2,	  // 2 - Ответы со стороны игрока о получении пакета и результатах обсчета хода.
	OG_SEEDS_PACKET = 3,	  // 3 - Ходы игроков.
	OG_COMPLETED_GAME_PACKET = 4, // 4 - Информация по состоявшейся игре.
	OG_SYS_PACKET = 5,		  // 5 - Административный тип пакетов для проверки корректности игры.
	OG_REFRESH_PACKET = 6,	  // 6 - Обновление информации о ходе для экспресс-игры
	OG_REFRESH_ANSWER_PACKET = 7, // 7 - Ответ на 6й пакет
	OG_ARCADE_GAME_PACKET = 8	  // 8 - Запуск тестовой версии с сервера

function GamePacket() {
  this.data = {
    Version: 104,
    TType: OG_GAME_PACKET,
    ID: 0,
    LID: 0,
    GAME_OWNER_UID: 0,
    OWNER_UID: 0,
    PASSWORD: '',
    KD_WORLD_ID: 0,
    KD_ROUTE_ID: 0,
    GAME_RND: 0,
    GTYPE: 'A',
    LAPS: 0,
    SEEDS: 0,
    DURATION: 0,
    MOVE_CNT: 0,
    PLAYERS_CNT: 0,
    STEPS_CNT: 0,
    EXPRESS: 'Y',
    URL_POST: '',
    URL_POST_PORT: '',
    URL_POST_PATH: '',
    URL_RETURN: '',
    PLAYERS: [],
    STEPS: [],
  };

  const data = this.data;

  this.writePacket = () => {
    let result = '';
    result = `KDLAB;${data.Version};${data.TType};${data.ID};${data.LID};${data.GAME_OWNER_UID};${data.OWNER_UID};${data.PASSWORD};`+
    `${data.KD_WORLD_ID};${data.KD_ROUTE_ID};${data.GAME_RND};${data.GTYPE};${data.LAPS};${data.SEEDS};${data.DURATION};`+
    `${data.MOVE_CNT};${data.PLAYERS_CNT};${data.STEPS_CNT};${data.EXPRESS};${data.URL_POST};${data.URL_POST_PORT};`+
    `${data.URL_POST_PATH};${data.URL_RETURN};`;
    if(data.TType != OG_SEEDS_PACKET && data.TType != OG_REFRESH_PACKET && data.TType != OG_REFRESH_ANSWER_PACKET) {
      for (let i=0; i<data.PLAYERS_CNT; i++) {
        result += `${this.data.PLAYERS[i].UID};${this.data.PLAYERS[i].NIC};${this.data.PLAYERS[i].PERS_CAR_COMP_ID};${this.data.PLAYERS[i].FRONT_CAR_COMP_ID};`+
        `${this.data.PLAYERS[i].FWHEEL_CAR_COMP_ID};${this.data.PLAYERS[i].BWHEEL_CAR_COMP_ID};${this.data.PLAYERS[i].ROBOT};`
      }
    }
    result += 'BITRIX';

    return result;
  }

  this.readPacket = (packet) => {
    packet = parseRequest(packet);
    packet = packet.slice(1);
    this.data = {
      Version: packet[0],
      TType: packet[1],
      ID: packet[2],
      LID: packet[3],
      GAME_OWNER_UID: packet[4],
      OWNER_UID: packet[5],
      PASSWORD: packet[6],
      KD_WORLD_ID: packet[7],
      KD_ROUTE_ID: packet[8],
      GAME_RND: packet[9],
      GTYPE: packet[10],
      LAPS: packet[11],
      SEEDS: packet[12],
      DURATION: packet[13],
      MOVE_CNT: packet[14],
      PLAYERS_CNT: packet[15],
      STEPS_CNT: packet[16],
      EXPRESS: packet[17],
    };

    if(data.TType != OG_SEEDS_PACKET && data.TType != OG_REFRESH_PACKET && data.TType != OG_REFRESH_ANSWER_PACKET) {
      let shift = 17;
      for (let i=0; i<data.PLAYERS_CNT; i++) {
        this.data.PLAYERS.push({
          UID: packet[shift+0],
          NIC: packet[shift+1],
          PERS_CAR_COMP_ID: packet[shift+2],
          FRONT_CAR_COMP_ID: packet[shift+3],
          FWHEEL_CAR_COMP_ID: packet[shift+4],
          BWHEEL_CAR_COMP_ID: packet[shift+5],
          ROBOT: packet[shift+6],
        })
        shift+=7;
      }
    }
 }
}

const packet = new GamePacket;
console.log(packet.writePacket());

const games = {
  0: {
    ID: '0',
    GAME_RND: '0',
    GTYPE: 'A',
    LAPS: 5,
    SEEDS: 200,
    DURATION: 10,
    MOVE_CNT: 0,
    STEPS_CNT: 0,
    KD_WORLD_ID: 0,
    KD_ROUTE_ID: 0,
    EXPRESS: 'Y',
    GAME_OWNER_ID: '0',
    players: {
      0: {
        UID: '0',
        NIC: 'player',
        PERS_CAR_COMP_ID: 1,
        FRONT_CAR_COMP_ID: 1,
        FWHEEL_CAR_COMP_ID: 1,
        BWHEEL_CAR_COMP_ID: 1,
        ROBOT: 'N',
        turns: [],
        sent: false,
      },
      1: {
        UID: '1',
        NIC: 'player2',
        PERS_CAR_COMP_ID: 1,
        FRONT_CAR_COMP_ID: 1,
        FWHEEL_CAR_COMP_ID: 1,
        BWHEEL_CAR_COMP_ID: 1,
        ROBOT: 'N',
        turns: [],
        sent: false,
      }
    }
  }
};

function getPlayersString(game) {
  return Object.values(games[game].players).map((player:any) => `${player.UID};${player.NIC};1;1;1;1;${player.ROBOT}`).join(';');
}

function getGameString(game, player) {
  return `${games[game].ID};0;0;${player};password;`+
  `${games[game].KD_WORLD_ID};${games[game].KD_ROUTE_ID};${games[game].GAME_RND};`+
  `${games[game].GTYPE};${games[game].LAPS};${games[game].SEEDS};`+
  `${games[game].DURATION};${games[game].MOVE_CNT};${Object.values(games[game].players).length};`+
  `${games[game].STEPS_CNT};${games[game].EXPRESS}`;
}

function getSeedsString(game) {
  return Object.values(games[game].players).map((player:any) => player.turns[player.turns.length-1]).join(';');
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
    games[0].MOVE_CNT=0;
    games[0].STEPS_CNT=0;
    res.send(`KDLAB;104;0;${getGameString(0, req.query.USERID)};;;;;;;${getPlayersString(0)};BITRIX`);
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
            res.send(`KDLAB;104;${OG_GAME_PACKET};${getGameString(0, data[6])};;;;;;;${getPlayersString(0)};`+
            `${games[0].STEPS_CNT};${Object.values(games[0].players).length};${getSeedsString(0)};BITRIX`);
        } else if (parseInt(data[2]) === OG_SEEDS_PACKET) {
          games[0].MOVE_CNT+=1;
          games[0].STEPS_CNT+=1;
          // games[0].players[data[25]].turns.push(data.slice(25).join(';'));
          games[0].players[data[25]].turns = [data.slice(25).join(';')];
          // games[0].players[1].turns.push([1, ...data.slice(26)].join(';'));
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
