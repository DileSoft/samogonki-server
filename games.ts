import { GameData } from "./types";

export function createGame():GameData {
    return {
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
}