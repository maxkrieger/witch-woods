import { v4 } from "uuid";
import { random, times } from "lodash";

export enum Ability {
  TELEPORT = "teleport",
  ICE_TRAP = "icetrap",
  SEEING_EYE = "seeingeye",
  NONE = "none",
}

export const abilityCooldowns: { [ability in Ability]: number } = {
  [Ability.TELEPORT]: 30,
  [Ability.ICE_TRAP]: 20,
  [Ability.SEEING_EYE]: 30,
  [Ability.NONE]: 0,
};

export enum ResourceType {
  MUSHRED = "mushred",
  MUSHORANGE = "mushorange",
  FLOWER1 = "flower1",
  IVY = "ivy",
  MUSHSTACK = "mushstack",
  MUSHWHITE = "mushwhite",
  FLOWER2 = "flower2",
  ROSE = "rose",
}

export interface ResourceDefinition {
  type: ResourceType;
  maxHealth: number;
  spriteIndex: number;
  ability: Ability;
  rangeX: [number, number];
  rangeY: [number, number];
}

export const MushredResource: ResourceDefinition = {
  type: ResourceType.MUSHRED,
  maxHealth: 5,
  spriteIndex: 0,
  ability: Ability.TELEPORT,
  rangeX: [150, 2530],
  rangeY: [230, 1870],
};

export const MushorangeResource: ResourceDefinition = {
  type: ResourceType.MUSHORANGE,
  maxHealth: 5,
  spriteIndex: 1,
  ability: Ability.NONE,
  rangeX: [1350, 2950],
  rangeY: [2600, 4550],
};

export const Flower1Resource: ResourceDefinition = {
  type: ResourceType.FLOWER1,
  maxHealth: 5,
  spriteIndex: 2,
  ability: Ability.NONE,
  rangeX: [2277, 4040],
  rangeY: [4300, 5470],
};

export const IvyResource: ResourceDefinition = {
  type: ResourceType.IVY,
  maxHealth: 3,
  spriteIndex: 3,
  ability: Ability.NONE,

  rangeX: [3838, 6000],
  rangeY: [2962, 3736],
};

export const MushstackResource: ResourceDefinition = {
  type: ResourceType.MUSHSTACK,
  maxHealth: 3,
  spriteIndex: 4,
  ability: Ability.NONE,

  rangeX: [6167, 8388],
  rangeY: [4233, 5736],
};

export const MushwhiteResource: ResourceDefinition = {
  type: ResourceType.MUSHWHITE,
  maxHealth: 10,
  spriteIndex: 5,
  ability: Ability.ICE_TRAP,

  rangeX: [7070, 8606],
  rangeY: [2670, 4164],
};

export const Flower2Resource: ResourceDefinition = {
  type: ResourceType.FLOWER2,
  maxHealth: 2,
  spriteIndex: 6,
  ability: Ability.SEEING_EYE,

  rangeX: [7422, 10000],
  rangeY: [247, 1900]
};

export const RoseResource: ResourceDefinition = {
  type: ResourceType.ROSE,
  maxHealth: 2,
  spriteIndex: 7,
  ability: Ability.NONE,

  rangeX: [3838, 6000],
  rangeY: [2962, 3736],
};

// REGENERATE RESOURCES

export const resourceTypes: { [id in ResourceType]: ResourceDefinition } = {
  mushred: MushredResource,
  mushorange: MushorangeResource,
  flower1: Flower1Resource,
  ivy: IvyResource,
  mushstack: MushstackResource,
  mushwhite: MushwhiteResource,
  flower2: Flower2Resource,
  rose: RoseResource,
};

export enum Team {
  RED = "red",
  BLUE = "blue",
}

export interface InventoryEntryI {
  resourceType: ResourceType;
  quantity: number;
  cooldown: number;
}

export type InventoryEntry = InventoryEntryI | null;

export enum Facing {
  LEFT = "left",
  RIGHT = "right",
  UP = "up",
  DOWN = "down",
}

export interface ENormal {
  kind: "normal";
}

export interface EIceTrapped {
  kind: "ice_trapped";
  remaining: number;
}

export interface ESeeingEye {
  kind: "seeing_eye";
  remaining: number;
}

export type Effect = ENormal | EIceTrapped | ESeeingEye;
export interface Player {
  name: string;
  id: string;
  x: number;
  y: number;
  moving: boolean;
  facing: Facing;
  effect: Effect;
  team: Team;
  inventory: InventoryEntry[];
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  resourceType: ResourceType;
  health: number;
  channeling: string | null;
}

export interface ResourceRequirement {
  quantity: number;
  quantityRequired: number;
  resourceType: ResourceType;
}

export interface Trap {
  x: number;
  y: number;
  team: Team;
  id: string;
  madeBy: string;
}

export const makeTrap = (
  x: number,
  y: number,
  team: Team,
  madeBy: string
): Trap => ({
  x,
  y,
  team,
  id: v4(),
  madeBy,
});

export interface Status {
  red: ResourceRequirement[];
  blue: ResourceRequirement[];
  state: "LOBBY" | "STARTED" | "ENDED";
}

export interface GameState {
  players: { [id: string]: Player };
  objects: { [id: string]: GameObject };
  traps: { [id: string]: Trap };
  status: Status;
}

const makeResource = (definition: ResourceDefinition): GameObject => ({
  id: v4(),
  x: random(definition.rangeX[0], definition.rangeX[1]),
  y: random(definition.rangeY[0], definition.rangeY[1]),
  resourceType: definition.type,
  health: definition.maxHealth,
  channeling: null,
});

const makeResourceReq = (type: ResourceType): ResourceRequirement => ({
  quantity: 0,
  quantityRequired: random(2, 10),
  resourceType: type,
});

export const makePlayer = (name: string, team: Team): Player => {
  const x = team === Team.RED ? 8400 : 1776;
  const y = team === Team.RED ? 1024 : 1024;
  return {
    name,
    id: v4(),
    x: random(x - 50, x + 50),
    y: random(y - 50, y + 50),
    team,
    inventory: [],
    moving: false,
    facing: Facing.DOWN,
    effect: { kind: "normal" },
  };
};

export default (): GameState => {
  const init: GameState = {
    players: {},
    objects: {},
    traps: {},
    status: {
      red: [
        makeResourceReq(ResourceType.MUSHRED),
        makeResourceReq(ResourceType.IVY),
        makeResourceReq(ResourceType.ROSE),
      ],
      blue: [
        makeResourceReq(ResourceType.MUSHRED),
        makeResourceReq(ResourceType.IVY),
        makeResourceReq(ResourceType.ROSE),
      ],
      state: "LOBBY",
    },
  };
  times(12, () => makeResource(MushredResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(MushorangeResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(Flower1Resource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(IvyResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(MushstackResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(MushwhiteResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(Flower2Resource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(12, () => makeResource(RoseResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  return init;
};
