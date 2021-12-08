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
    outPacket.data = {...outPacket.data, ...games[parseInt(req.query.ID)]};
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
          const currentGame = games[inPacket.data.ID];
          
          outPacket.data = {...outPacket.data, ...currentGame};
          outPacket.data.OWNER_UID = inPacket.data.OWNER_UID;
          
          if (currentGame.STEPS_RECEIVED.length === currentGame.PLAYERS.length) {
            outPacket.data.TType = PacketType.OG_GAME_PACKET;

            if (!currentGame.STEPS_SENT.includes(inPacket.data.OWNER_UID)) {
              currentGame.STEPS_SENT.push(inPacket.data.OWNER_UID);
            }

            if (currentGame.STEPS_SENT.length === currentGame.PLAYERS.length) {
              currentGame.STEPS_RECEIVED = [];
              currentGame.STEPS_SENT = [];
            }
          } else {
            outPacket.data.TType = PacketType.OG_REFRESH_ANSWER_PACKET;
          }
          
          console.log('out:');
          console.log(JSON.stringify(outPacket.data, null, 2))
          
          res.send(outPacket.writePacket());
        } else if (inPacket.data.TType === PacketType.OG_SEEDS_PACKET) {
          const currentGame = games[inPacket.data.ID];
          const currentStep = inPacket.data.STEPS.find(step => step.STEP_ID == currentGame.MOVE_CNT + 1);
          const currentPlayerTurn = currentStep ? currentStep.PLAYER_TURNS.find(turn => turn.UID === inPacket.data.OWNER_UID) : null;

          if (!currentGame.STEPS_RECEIVED.includes(inPacket.data.OWNER_UID)) {
            currentGame.STEPS_RECEIVED.push(inPacket.data.OWNER_UID);

            if (!currentGame.STEPS[currentGame.MOVE_CNT]) {
              currentGame.STEPS.push({
                STEP_ID: currentStep.STEP_ID,
                USERS_CNT: 0,
                PLAYER_TURNS: []
              })
            }
            currentGame.STEPS[currentGame.MOVE_CNT].USERS_CNT++;
            currentGame.STEPS[currentGame.MOVE_CNT].PLAYER_TURNS.push(
              currentPlayerTurn
            );
  
            if (currentGame.STEPS_RECEIVED.length == currentGame.PLAYERS.length) {
              currentGame.STEPS_CNT++;
              currentGame.MOVE_CNT++;
            }
          } else {
            const existingPlayerTurnIndex = currentGame.STEPS[currentGame.MOVE_CNT].PLAYER_TURNS
            .findIndex(player_turn => player_turn.UID === inPacket.data.OWNER_UID);
            currentGame.STEPS[currentGame.MOVE_CNT].PLAYER_TURNS[existingPlayerTurnIndex] = currentPlayerTurn;
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
