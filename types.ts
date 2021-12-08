
export type YesNo = 'Y' | 'N';
export type GameType = 'W' | 'A';

export interface GamePacketPlayer {
    UID: number,
    NIC: string,
    PERS_CAR_COMP_ID: number,
    FRONT_CAR_COMP_ID: number,
    FWHEEL_CAR_COMP_ID: number,
    BWHEEL_CAR_COMP_ID: number,
    ROBOT: YesNo,
    TURNS?: any[],
    sent?: boolean,
  }
  
  export interface GamePacketTurnInfo {
    STEP_ID: number,
    USERS_CNT: number,
    PLAYER_TURNS: GamePacketPlayerTurnInfo[]
  }
  
  export interface GamePacketPlayerTurnInfo {
    UID: number,
    IS_FINISHED: YesNo,
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
  
  export interface GameData {
    ID: number,
    LID: number,
    GAME_OWNER_UID: number,
    PASSWORD: string,
    KD_WORLD_ID: number,
    KD_ROUTE_ID: number,
    GAME_RND: number,
    GTYPE: GameType,
    LAPS: number,
    SEEDS: number,
    DURATION: number,
    MOVE_CNT: number,
    PLAYERS_CNT: number,
    STEPS_CNT: number,
    EXPRESS: YesNo,
    PLAYERS: GamePacketPlayer[],
    STEPS: GamePacketTurnInfo[],
    STEPS_RECEIVED?: number[],
    STEPS_SENT?: number[],
  }
  
  export interface GamePacketData extends GameData {
    Version: number,
    TType: PacketType,
    OWNER_UID: number,
    URL_POST: string,
    URL_POST_PORT: number,
    URL_POST_PATH: string,
    URL_RETURN: string,
  }
  
  export enum PacketType { 
      OG_GAME_PACKET = 1, 	  // 1 - Пакеты, передаваемые от сервера в игру с заголовком и информацией о сделанных ходах.
      OG_CONTROL_PACKET = 2,	  // 2 - Ответы со стороны игрока о получении пакета и результатах обсчета хода.
      OG_SEEDS_PACKET = 3,	  // 3 - Ходы игроков.
      OG_COMPLETED_GAME_PACKET = 4, // 4 - Информация по состоявшейся игре.
      OG_SYS_PACKET = 5,		  // 5 - Административный тип пакетов для проверки корректности игры.
      OG_REFRESH_PACKET = 6,	  // 6 - Обновление информации о ходе для экспресс-игры
      OG_REFRESH_ANSWER_PACKET = 7, // 7 - Ответ на 6й пакет
      OG_ARCADE_GAME_PACKET = 8	  // 8 - Запуск тестовой версии с сервера
  }