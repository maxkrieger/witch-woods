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
}

export const MushroomResource: ResourceDefinition = {
  type: ResourceType.MUSHROOM,
  maxHealth: 5,
  spriteIndex: 1,
  ability: Ability.TELEPORT,
};

export const PineconeResource: ResourceDefinition = {
  type: ResourceType.PINECONE,
  maxHealth: 10,
  spriteIndex: 0,
  ability: Ability.ICE_TRAP,
};

export const RoseResource: ResourceDefinition = {
  type: ResourceType.ROSE,
  maxHealth: 2,
  spriteIndex: 2,
  ability: Ability.SEEING_EYE,
};

export const IvyResource: ResourceDefinition = {
  type: ResourceType.IVY,
  maxHealth: 3,
  spriteIndex: 5,
  ability: Ability.NONE,
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

interface Normal {
  kind: "normal";
}

interface IceTrapped {
  kind: "ice_trapped";
  remaining: number;
}

export type Effect = Normal | IceTrapped;
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
}

export const makeTrap = (x: number, y: number, team: Team): Trap => ({
  x,
  y,
  team,
  id: v4(),
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
  x: random(0, 10000),
  y: random(0, 5800),
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
  times(10, () => makeResource(MushroomResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );

  times(10, () => makeResource(PineconeResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  times(10, () => makeResource(RoseResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  return init;
};
