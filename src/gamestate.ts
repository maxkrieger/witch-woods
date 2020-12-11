import { v4 } from "uuid";
import { random, times } from "lodash";

export enum ResourceType {
  PINECONE = "pinecone",
  MUSHROOM = "mushroom",
}

export interface ResourceDefinition {
  type: ResourceType;
  maxHealth: number;
  spriteIndex: number;
}

export const MushroomResource: ResourceDefinition = {
  type: ResourceType.MUSHROOM,
  maxHealth: 5,
  spriteIndex: 1,
};

export const PineconeResource: ResourceDefinition = {
  type: ResourceType.PINECONE,
  maxHealth: 10,
  spriteIndex: 0,
};

export const resourceTypes: { [id in ResourceType]: ResourceDefinition } = {
  mushroom: MushroomResource,
  pinecone: PineconeResource,
};

export enum Team {
  RED = "red",
  BLUE = "blue",
}

export interface InventoryEntryI {
  resourceType: ResourceType;
  quantity: number;
}

export type InventoryEntry = InventoryEntryI | null;

export enum Facing {
  LEFT = "left",
  RIGHT = "right",
  UP = "up",
  DOWN = "down",
}
export interface Player {
  name: string;
  id: string;
  x: number;
  y: number;
  moving: boolean;
  facing: Facing;
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

export interface Status {
  red: ResourceRequirement[];
  blue: ResourceRequirement[];
  won: boolean;
}

export interface GameState {
  players: { [id: string]: Player };
  objects: { [id: string]: GameObject };
  status: Status;
}

const makeResource = (definition: ResourceDefinition): GameObject => ({
  id: v4(),
  x: random(0, 5000),
  y: random(0, 2900),
  resourceType: definition.type,
  health: definition.maxHealth,
  channeling: null,
});

const makeResourceReq = (type: ResourceType): ResourceRequirement => ({
  quantity: 0,
  quantityRequired: random(2, 10),
  resourceType: type,
});

export const makePlayer = (name: string, team: Team): Player => ({
  name,
  id: v4(),
  x: random(0, 1000),
  y: random(0, 1000),
  team,
  inventory: [],
  moving: false,
  facing: Facing.RIGHT,
});

export default (): GameState => {
  const init: GameState = {
    players: {},
    objects: {},
    status: {
      red: [
        makeResourceReq(ResourceType.MUSHROOM),
        makeResourceReq(ResourceType.PINECONE),
      ],
      blue: [
        makeResourceReq(ResourceType.MUSHROOM),
        makeResourceReq(ResourceType.PINECONE),
      ],
      won: false,
    },
  };
  times(10, () => makeResource(MushroomResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );

  times(10, () => makeResource(PineconeResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );
  return init;
};
