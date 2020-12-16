import { v4 } from "uuid";
import { random, sample, sampleSize, times } from "lodash";

export enum Ability {
  TELEPORT = "teleport",
  ICE_TRAP = "icetrap",
  SEEING_EYE = "seeingeye",
  NONE = "none",
}

export const sumReqs = (reqs: ResourceRequirement[]) =>
  reqs.reduce((a: number, b: ResourceRequirement) => a + b.quantityRequired, 0);

export const sumHave = (reqs: ResourceRequirement[]) =>
  reqs.reduce((a: number, b: ResourceRequirement) => a + b.quantity, 0);

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
}

interface Range {
  rangeX: [number, number];
  rangeY: [number, number];
}

export const RANGES: Range[] = [
  {
    rangeX: [1200, 2200],
    rangeY: [5080, 5800],
  },
  {
    rangeX: [3838, 6000],
    rangeY: [2962, 3500],
  },
  {
    rangeX: [7800, 9000],
    rangeY: [5100, 5800],
  },
  {
    rangeX: [2525, 3970],
    rangeY: [3775, 5500],
  },
  {
    rangeX: [5970, 7480],
    rangeY: [4130, 5564],
  },
  {
    rangeX: [3838, 6000],
    rangeY: [2962, 3736],
  },
  {
    rangeX: [5615, 6500],
    rangeY: [75, 680],
  },
  {
    rangeX: [3480, 4200],
    rangeY: [75, 680],
  },
];

export const MushredResource: ResourceDefinition = {
  type: ResourceType.MUSHRED,
  maxHealth: 5,
  spriteIndex: 0,
  ability: Ability.TELEPORT,
};

export const MushorangeResource: ResourceDefinition = {
  type: ResourceType.MUSHORANGE,
  maxHealth: 10,
  spriteIndex: 1,
  ability: Ability.ICE_TRAP,
};

export const Flower1Resource: ResourceDefinition = {
  type: ResourceType.FLOWER1,
  maxHealth: 5,
  spriteIndex: 2,
  ability: Ability.TELEPORT,
};

export const IvyResource: ResourceDefinition = {
  type: ResourceType.IVY,
  maxHealth: 4,
  spriteIndex: 3,
  ability: Ability.TELEPORT,
};

export const MushstackResource: ResourceDefinition = {
  type: ResourceType.MUSHSTACK,
  maxHealth: 3,
  spriteIndex: 4,
  ability: Ability.SEEING_EYE,
};

export const MushwhiteResource: ResourceDefinition = {
  type: ResourceType.MUSHWHITE,
  maxHealth: 10,
  spriteIndex: 5,
  ability: Ability.ICE_TRAP,
};

export const Flower2Resource: ResourceDefinition = {
  type: ResourceType.FLOWER2,
  maxHealth: 2,
  spriteIndex: 6,
  ability: Ability.SEEING_EYE,
};

export const RoseResource: ResourceDefinition = {
  type: ResourceType.ROSE,
  maxHealth: 9,
  spriteIndex: 7,
  ability: Ability.ICE_TRAP,
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
  winner: "NONE" | Team;
}

export interface GameState {
  players: { [id: string]: Player };
  objects: { [id: string]: GameObject };
  traps: { [id: string]: Trap };
  status: Status;
}

export const makeResource = (
  definition: ResourceDefinition,
  rangeX,
  rangeY
): GameObject => ({
  id: v4(),
  x: random(rangeX[0], rangeX[1]),
  y: random(rangeY[0], rangeY[1]),
  resourceType: definition.type,
  health: definition.maxHealth,
  channeling: null,
});

const makeResourceReq = (type: ResourceType): ResourceRequirement => ({
  quantity: 0,
  quantityRequired: Math.ceil(75 / resourceTypes[type].maxHealth),
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
  const resourceTypesArr = Object.keys(resourceTypes);
  const redReqs = sampleSize(resourceTypesArr, 3).map((typ) =>
    makeResourceReq(typ as ResourceType)
  );
  const blueReqs = sampleSize(resourceTypesArr, 3).map((typ) =>
    makeResourceReq(typ as ResourceType)
  );
  const init: GameState = {
    players: {},
    objects: {},
    traps: {},
    status: {
      red: redReqs,
      blue: blueReqs,
      state: "LOBBY",
      winner: "NONE",
    },
  };
  const redPlaces = sampleSize(RANGES, redReqs.length);
  redReqs.forEach((r, idx) => {
    const place = redPlaces[idx];
    times(Math.ceil(25 / resourceTypes[r.resourceType].maxHealth), () => {
      const item = makeResource(
        resourceTypes[r.resourceType],
        place.rangeX,
        place.rangeY
      );
      init.objects[item.id] = item;
    });
  });
  const bluePlaces = sampleSize(RANGES, blueReqs.length);
  blueReqs.forEach((r, idx) => {
    const place = bluePlaces[idx];
    times(Math.ceil(15 / resourceTypes[r.resourceType].maxHealth), () => {
      const item = makeResource(
        resourceTypes[r.resourceType],
        place.rangeX,
        place.rangeY
      );
      init.objects[item.id] = item;
    });
  });
  return init;
};
