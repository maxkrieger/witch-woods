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
  PINECONE = "pinecone",
  MUSHROOM = "mushroom",
  ROSE = "rose",
  IVY = "ivy",
}

export interface ResourceDefinition {
  type: ResourceType;
  maxHealth: number;
  spriteIndex: number;
  ability: Ability;
  rangeX: [number,number];
  rangeY: [number,number];
}

export const MushroomResource: ResourceDefinition = {
  type: ResourceType.MUSHROOM,
  maxHealth: 5,
  spriteIndex: 0,
  ability: Ability.TELEPORT,
  rangeX: [0,2500],
  rangeY: [0,5800]
};

export const PineconeResource: ResourceDefinition = {
  type: ResourceType.PINECONE,
  maxHealth: 10,
  spriteIndex: 4,
  ability: Ability.ICE_TRAP,

  rangeX: [2500,5000],
  rangeY: [0,5800]
};

export const RoseResource: ResourceDefinition = {
  type: ResourceType.ROSE,
  maxHealth: 2,
  spriteIndex: 7,
  ability: Ability.SEEING_EYE,

  rangeX: [5000,7500],
  rangeY: [0,5800]
};

export const IvyResource: ResourceDefinition = {
  type: ResourceType.IVY,
  maxHealth: 3,
  spriteIndex: 3,
  ability: Ability.NONE,

  rangeX: [7500,10000],
  rangeY: [0,5800]
};

// REGENERATE RESOURCES

export const resourceTypes: { [id in ResourceType]: ResourceDefinition } = {
  mushroom: MushroomResource,
  pinecone: PineconeResource,
  rose: RoseResource,
  ivy: IvyResource,
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
  x: random(definition.rangeX[0],definition.rangeX[1]),
  y: random(definition.rangeY[0],definition.rangeY[1]),
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
    inventory: [
      { resourceType: ResourceType.MUSHROOM, quantity: 10, cooldown: 0 },
      { resourceType: ResourceType.PINECONE, quantity: 10, cooldown: 0 },
      { resourceType: ResourceType.ROSE, quantity: 10, cooldown: 0 },
    ],
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
        makeResourceReq(ResourceType.MUSHROOM),
        makeResourceReq(ResourceType.PINECONE),
        makeResourceReq(ResourceType.ROSE),
      ],
      blue: [
        makeResourceReq(ResourceType.MUSHROOM),
        makeResourceReq(ResourceType.PINECONE),
        makeResourceReq(ResourceType.ROSE),
      ],
      state: "LOBBY",
    },
  };
  times(40, () => makeResource(MushroomResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );

  times(40, () => makeResource(PineconeResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(40, () => makeResource(RoseResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(40, () => makeResource(IvyResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  return init;
};
