import * as express from 'express';
const app = express()
app.use(express.text({type: '*/*'}))
const port = 80

interface GamePacketPlayer {
  UID: number,
  NIC: string,
  PERS_CAR_COMP_ID: number,
  FRONT_CAR_COMP_ID: number,
  FWHEEL_CAR_COMP_ID: number,
  BWHEEL_CAR_COMP_ID: number,
  ROBOT: string,
  TURNS?: any[],
  sent?: boolean,
}

interface GamePacketTurnInfo {
  STEP_ID: number,
  USERS_CNT: number,
  PLAYER_TURNS: GamePacketPlayerTurnInfo[]
}

interface GamePacketPlayerTurnInfo {
  UID: number,
  IS_FINISHED: string,
  RANK: number,
  MOVE_TIME: number,
  MOVE_STEPS: number,
  BOTTLES_CNT: number,
  TOTAL_SEEDS_CNT: number,
  ARCANES_CNT: number,
  DESTROYS_CNT: number,
  USER_SEEDS_CNT: number,
  SEEDS: string,
}

interface GameData {
  ID: number,
  LID: number,
  GAME_OWNER_UID: number,
  OWNER_UID: number,
  PASSWORD: string,
  KD_WORLD_ID: number,
  KD_ROUTE_ID: number,
  GAME_RND: number,
  GTYPE: string,
  LAPS: number,
  SEEDS: number,
  DURATION: number,
  MOVE_CNT: number,
  PLAYERS_CNT: number,
  STEPS_CNT: number,
  EXPRESS: string,
  PLAYERS: GamePacketPlayer[],
  STEPS: GamePacketTurnInfo[],
}

interface GamePacketData extends GameData {
  Version: number,
  TType: PacketType,
  URL_POST: string,
  URL_POST_PORT: string,
  URL_POST_PATH: string,
  URL_RETURN: string,
}

enum PacketType { 
	OG_GAME_PACKET = 1, 	  // 1 - Пакеты, передаваемые от сервера в игру с заголовком и информацией о сделанных ходах.
	OG_CONTROL_PACKET = 2,	  // 2 - Ответы со стороны игрока о получении пакета и результатах обсчета хода.
	OG_SEEDS_PACKET = 3,	  // 3 - Ходы игроков.
	OG_COMPLETED_GAME_PACKET = 4, // 4 - Информация по состоявшейся игре.
	OG_SYS_PACKET = 5,		  // 5 - Административный тип пакетов для проверки корректности игры.
	OG_REFRESH_PACKET = 6,	  // 6 - Обновление информации о ходе для экспресс-игры
	OG_REFRESH_ANSWER_PACKET = 7, // 7 - Ответ на 6й пакет
	OG_ARCADE_GAME_PACKET = 8	  // 8 - Запуск тестовой версии с сервера
}

class Packet {
  data:string[];
  shift:number = 0;
  constructor(packet:string) {
    this.data = parseRequest(packet);
    this.data = this.data.slice(1);
  }
  get():string {
    const result = this.data[this.shift];
    this.shift++;
    return result;
  }
  getInt():number {
    return parseInt(this.get());
  }
}

class GamePacket {
  data:GamePacketData = {
    Version: 104,
    TType: PacketType.OG_GAME_PACKET,
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

  writePacket = ():string => {
    let result = '';
    const data = this.data;
    result = `KDLAB;${data.Version};${data.TType};${data.ID};${data.LID};${data.GAME_OWNER_UID};${data.OWNER_UID};${data.PASSWORD};`+
    `${data.KD_WORLD_ID};${data.KD_ROUTE_ID};${data.GAME_RND};${data.GTYPE};${data.LAPS};${data.SEEDS};${data.DURATION};`+
    `${data.MOVE_CNT};${data.PLAYERS_CNT};${data.STEPS_CNT};${data.EXPRESS};${data.URL_POST};${data.URL_POST_PORT};`+
    `${data.URL_POST_PATH};${data.URL_RETURN};`;
    if(data.TType != PacketType.OG_SEEDS_PACKET && data.TType != PacketType.OG_REFRESH_PACKET && data.TType != PacketType.OG_REFRESH_ANSWER_PACKET) {
      for (let i=0; i<data.PLAYERS_CNT; i++) {
        result += `${this.data.PLAYERS[i].UID};${this.data.PLAYERS[i].NIC};${this.data.PLAYERS[i].PERS_CAR_COMP_ID};${this.data.PLAYERS[i].FRONT_CAR_COMP_ID};`+
        `${this.data.PLAYERS[i].FWHEEL_CAR_COMP_ID};${this.data.PLAYERS[i].BWHEEL_CAR_COMP_ID};${this.data.PLAYERS[i].ROBOT};`
      }
    }
    data.STEPS.forEach(step => {
      result += `${step.STEP_ID};${step.USERS_CNT};`;
      step.PLAYER_TURNS.forEach(playerTurnInfo => {
        result += `${playerTurnInfo.UID};${playerTurnInfo.IS_FINISHED};${playerTurnInfo.RANK};${playerTurnInfo.MOVE_TIME};${playerTurnInfo.MOVE_STEPS};`+
        `${playerTurnInfo.BOTTLES_CNT};${playerTurnInfo.TOTAL_SEEDS_CNT};${playerTurnInfo.ARCANES_CNT};${playerTurnInfo.DESTROYS_CNT};`+
        `${playerTurnInfo.USER_SEEDS_CNT};${playerTurnInfo.SEEDS};`
      });
    });
    result += 'BITRIX';

    return result;
  }

  readPacket = (packet:string) => {
    let packetArray = new Packet(packet);
    this.data = {...this.data,
      Version: packetArray.getInt(),
      TType: packetArray.getInt(),
      ID: packetArray.getInt(),
      LID: packetArray.getInt(),
      GAME_OWNER_UID: packetArray.getInt(),
      OWNER_UID: packetArray.getInt(),
      PASSWORD: packetArray.get(),
      KD_WORLD_ID: packetArray.getInt(),
      KD_ROUTE_ID: packetArray.getInt(),
      GAME_RND: packetArray.getInt(),
      GTYPE: packetArray.get(),
      LAPS: packetArray.getInt(),
      SEEDS: packetArray.getInt(),
      DURATION: packetArray.getInt(),
      MOVE_CNT: packetArray.getInt(),
      PLAYERS_CNT: packetArray.getInt(),
      STEPS_CNT: packetArray.getInt(),
      EXPRESS: packetArray.get(),
    };

    packetArray.get();
    packetArray.get();
    packetArray.get();
    packetArray.get();

    const data = this.data;
    if(data.TType != PacketType.OG_SEEDS_PACKET && data.TType != PacketType.OG_REFRESH_PACKET && data.TType != PacketType.OG_REFRESH_ANSWER_PACKET) {
      for (let i=0; i<data.PLAYERS_CNT; i++) {
        this.data.PLAYERS.push({
          UID: packetArray.getInt(),
          NIC: packetArray.get(),
          PERS_CAR_COMP_ID: packetArray.getInt(),
          FRONT_CAR_COMP_ID: packetArray.getInt(),
          FWHEEL_CAR_COMP_ID: packetArray.getInt(),
          BWHEEL_CAR_COMP_ID: packetArray.getInt(),
          ROBOT: packetArray.get(),
        })
      }
    }

    for(let i = 0; i < data.STEPS_CNT; i++) {
      const step:GamePacketTurnInfo = {
        STEP_ID: packetArray.getInt(),
        USERS_CNT: packetArray.getInt(),
        PLAYER_TURNS: [],
      };
      for(let i2 = 0; i2 < step.USERS_CNT; i2++) {
        const playerTurnInfo:GamePacketPlayerTurnInfo = {
          UID: packetArray.getInt(),
          IS_FINISHED: packetArray.get(),
          RANK: packetArray.getInt(),
          MOVE_TIME: packetArray.getInt(),
          MOVE_STEPS: packetArray.getInt(),
          BOTTLES_CNT: packetArray.getInt(),
          TOTAL_SEEDS_CNT: packetArray.getInt(),
          ARCANES_CNT: packetArray.getInt(),
          DESTROYS_CNT: packetArray.getInt(),
          USER_SEEDS_CNT: packetArray.getInt(),
          SEEDS: '',
        }
        playerTurnInfo.SEEDS = packetArray.get();
        step.PLAYER_TURNS.push(playerTurnInfo);
      }
      data.STEPS.push(step)
    }
  }
}

const packet = new GamePacket;
const games:GameData[] = [
  {
    ID: 0,
    LID: 0,
    GAME_OWNER_UID: 0,
    OWNER_UID: 0,
    KD_WORLD_ID: 0,
    KD_ROUTE_ID: 0,
    PASSWORD: '',
    GAME_RND: 0,
    GTYPE: 'A',
    LAPS: 5,
    SEEDS: 200,
    DURATION: 10,
    MOVE_CNT: 0,
    PLAYERS_CNT: 2,
    STEPS_CNT: 0,
    EXPRESS: 'Y',
    STEPS: [],
    PLAYERS: [
      {
        UID: 0,
        NIC: 'player',
        PERS_CAR_COMP_ID: 1,
        FRONT_CAR_COMP_ID: 1,
        FWHEEL_CAR_COMP_ID: 1,
        BWHEEL_CAR_COMP_ID: 1,
        ROBOT: 'N',
        TURNS: [],
        sent: false,
      },
      {
        UID: 1,
        NIC: 'player2',
        PERS_CAR_COMP_ID: 1,
        FRONT_CAR_COMP_ID: 1,
        FWHEEL_CAR_COMP_ID: 1,
        BWHEEL_CAR_COMP_ID: 1,
        ROBOT: 'N',
        TURNS: [],
        sent: false,
      }
    ]
  }
];

function getPlayersString(game) {
  return games[game].PLAYERS.map((player) => `${player.UID};${player.NIC};1;1;1;1;${player.ROBOT}`).join(';');
}

function getGameString(game, player) {
  return `${games[game].ID};0;0;${player};password;`+
  `${games[game].KD_WORLD_ID};${games[game].KD_ROUTE_ID};${games[game].GAME_RND};`+
  `${games[game].GTYPE};${games[game].LAPS};${games[game].SEEDS};`+
  `${games[game].DURATION};${games[game].MOVE_CNT};${games[game].PLAYERS.length};`+
  `${games[game].STEPS_CNT};${games[game].EXPRESS}`;
}

function getSeedsString(game) {
  return games[game].PLAYERS.map((player) => player.TURNS[player.TURNS.length-1]).join(';');
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
        console.log(data.join(';'));
        const packet = new GamePacket;
        packet.readPacket(req.body);
        console.log(JSON.stringify(packet, null, 2))
        console.log(packet.writePacket());
        if (parseInt(data[2]) === PacketType.OG_REFRESH_PACKET) {
          console.log('go');
            res.send(`KDLAB;104;${PacketType.OG_GAME_PACKET};${getGameString(0, data[6])};;;;;;;${getPlayersString(0)};`+
            `${games[0].STEPS_CNT};${games[0].PLAYERS.length};${getSeedsString(0)};BITRIX`);
        } else if (parseInt(data[2]) === PacketType.OG_SEEDS_PACKET) {
          games[0].MOVE_CNT+=1;
          games[0].STEPS_CNT+=1;
          // games[0].players[data[25]].turns.push(data.slice(25).join(';'));
          games[0].PLAYERS[data[25]].TURNS = [data.slice(25).join(';')];
          // games[0].players[1].turns.push([1, ...data.slice(26)].join(';'));
          console.log(getSeedsString(0));
          res.send('OK:KDLAB');
        } else if (parseInt(data[2]) === PacketType.OG_CONTROL_PACKET) {
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
