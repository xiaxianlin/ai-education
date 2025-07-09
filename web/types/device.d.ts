declare global {
  interface Device {
    did: string;
    name: string;
    type: number;
    status: number;
    create_time: number;
    update_time?: number;
    robot?: Robot;
  }

  interface Robot {
    did: string;
    nickname: string;
    wakeup: string;
    voice: string;
    welcome: string;
    status: number;
    ip: string;
    create_time: number;
    update_time?: number;
  }

  interface RobotFormModel {
    nickname?: string;
    wakeup?: string;
    voice?: string;
    welcome?: string;
    status?: number;
  }

  interface RobotVoice {
    name: string;
    value: string;
    url: string;
  }
}

export {};
