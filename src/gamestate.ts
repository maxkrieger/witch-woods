import { v4 } from "uuid";
import { random, times } from "lodash";

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

export const RoseResource: ResourceDefinition = {
  type: ResourceType.ROSE,
  maxHealth: 2,
  spriteIndex: 2,
};

export const IvyResource: ResourceDefinition = {
  type: ResourceType.IVY,
  maxHealth: 3,
  spriteIndex: 5,
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
  const x = team === Team.RED ? 4140 : 920;
  const y = team === Team.RED ? 445 : 445;
  return {
    name,
    id: v4(),
    x: random(x - 50, x + 50),
    y: random(y - 50, y + 50),
    team,
    inventory: [],
    moving: false,
    facing: Facing.RIGHT,
  };
};

export default (): GameState => {
  const init: GameState = {
    players: {},
    objects: {},
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
      won: false,
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
