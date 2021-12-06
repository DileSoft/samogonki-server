import * as express from 'express';
import {GameData, PacketType} from './types';
import {GamePacket} from './classes';
const app = express()
app.use(express.text({type: '*/*'}))
const port = 80

const games:GameData[] = [
  {
    ID: 0,
    LID: 0,
    GAME_OWNER_UID: 0,
    KD_WORLD_ID: 0,
    KD_ROUTE_ID: 0,
    PASSWORD: 'password',
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
    STEPS_RECEIVED: [],
    STEPS_SENT: [],
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

app.get('*', (req, res) => {
  console.log('get');
  console.log(req.query);
  if (req.path === '/game-on-line/default.asp') {
    const outPacket = new GamePacket;
    outPacket.data = {...outPacket.data, ...games[0]};
    outPacket.data.TType = PacketType.OG_CONTROL_PACKET;
    outPacket.data.OWNER_UID = req.query.USERID;
    console.log('out:');
    console.log(JSON.stringify(outPacket.data, null, 2))
    // console.log(outPacket.writePacket());
    res.send(outPacket.writePacket());
  } else {
    res.send('Hello World!')
  }
})

app.post('*', (req, res) => {
    console.log('post');
    if (req.path === '/game-on-line/default.asp') {
        const inPacket = new GamePacket;
        inPacket.readPacket(req.body);
        console.log('in:');
        console.log(JSON.stringify(inPacket, null, 2))
        const outPacket = new GamePacket;
        if (inPacket.data.TType === PacketType.OG_REFRESH_PACKET) {
          outPacket.data = {...outPacket.data, ...games[inPacket.data.ID]};
          outPacket.data.OWNER_UID = inPacket.data.OWNER_UID;
          if (games[inPacket.data.ID].STEPS_RECEIVED.length === games[inPacket.data.ID].PLAYERS.length) {
            outPacket.data.TType = PacketType.OG_GAME_PACKET;
            if (!games[inPacket.data.ID].STEPS_SENT.includes(inPacket.data.OWNER_UID)) {
              games[inPacket.data.ID].STEPS_SENT.push(inPacket.data.OWNER_UID);
            }
            if (games[inPacket.data.ID].STEPS_SENT.length === games[inPacket.data.ID].PLAYERS.length) {
              games[inPacket.data.ID].STEPS_RECEIVED = [];
              games[inPacket.data.ID].STEPS_SENT = [];
            }
          } else {
            outPacket.data.TType = PacketType.OG_REFRESH_ANSWER_PACKET;
          }
          console.log('out:');
          console.log(JSON.stringify(outPacket.data, null, 2))
          res.send(outPacket.writePacket());
        } else if (inPacket.data.TType === PacketType.OG_SEEDS_PACKET) {
          if (!games[inPacket.data.ID].STEPS_RECEIVED.includes(inPacket.data.OWNER_UID)) {
            games[inPacket.data.ID].STEPS_RECEIVED.push(inPacket.data.OWNER_UID);

            if (!games[inPacket.data.ID].STEPS[games[inPacket.data.ID].MOVE_CNT]) {
              games[inPacket.data.ID].STEPS.push({
                STEP_ID: inPacket.data.STEPS[0].STEP_ID,
                USERS_CNT: 0,
                PLAYER_TURNS: []
              })
            }
            games[inPacket.data.ID].STEPS[games[inPacket.data.ID].MOVE_CNT].USERS_CNT++;
            games[inPacket.data.ID].STEPS[games[inPacket.data.ID].MOVE_CNT].PLAYER_TURNS.push(
              inPacket.data.STEPS[0].PLAYER_TURNS[0]
            );
  
  
            if (games[inPacket.data.ID].STEPS_RECEIVED.length == games[inPacket.data.ID].PLAYERS.length) {
              games[inPacket.data.ID].STEPS_CNT++;
              games[inPacket.data.ID].MOVE_CNT++;
            }
          } else {
            const existingPlayerTurnIndex = games[inPacket.data.ID].STEPS[games[inPacket.data.ID].MOVE_CNT].PLAYER_TURNS
            .findIndex(player_turn => player_turn.UID === inPacket.data.OWNER_UID);
            games[inPacket.data.ID].STEPS[games[inPacket.data.ID].MOVE_CNT].PLAYER_TURNS[existingPlayerTurnIndex] = inPacket.data.STEPS[0].PLAYER_TURNS[0];
          }
          res.send('OK:KDLAB');
        } else if (inPacket.data.TType === PacketType.OG_CONTROL_PACKET) {
          res.send('OK:KDLAB');
        }
    } else {
      res.send('Hello World!')
    }
  })
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
