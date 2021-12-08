import {PacketType, GamePacketData, GamePacketTurnInfo, GamePacketPlayerTurnInfo, YesNo, GameType} from './types';

export function parseRequest(request) {
    let result = request.split(';');
    const lastIndex = result.findIndex(item => item.startsWith('BITRIX'));
    if (lastIndex) {
      result = result.slice(0, lastIndex);
    }
    return result;
  }
  
  export class Packet {
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
  
  export class GamePacket {
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
      URL_POST_PORT: 0,
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
        GTYPE: packetArray.get() as GameType,
        LAPS: packetArray.getInt(),
        SEEDS: packetArray.getInt(),
        DURATION: packetArray.getInt(),
        MOVE_CNT: packetArray.getInt(),
        PLAYERS_CNT: packetArray.getInt(),
        STEPS_CNT: packetArray.getInt(),
        EXPRESS: packetArray.get() as YesNo,
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
            ROBOT: packetArray.get() as YesNo,
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
            IS_FINISHED: packetArray.get() as YesNo,
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