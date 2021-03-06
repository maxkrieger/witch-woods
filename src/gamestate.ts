import { v4 } from "uuid";
import { random, times } from "lodash";

export enum ResourceType {
  MUSHROOM = "mushroom",
  GEM = "gem",
}

export interface ResourceDefinition {
  type: ResourceType;
  maxHealth: number;
}

export const MushroomResource: ResourceDefinition = {
  type: ResourceType.MUSHROOM,
  maxHealth: 5,
};

export const GemResource: ResourceDefinition = {
  type: ResourceType.MUSHROOM,
  maxHealth: 10,
};

export const resourceTypes: { [id in ResourceType]: ResourceDefinition } = {
  mushroom: MushroomResource,
  gem: GemResource,
};

export type Team = "RED" | "BLUE";

export interface InventoryEntry {
  resourceType: ResourceType;
  quantity: number;
}

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
  redTeam: ResourceRequirement[];
  blueTeam: ResourceRequirement[];
  won: boolean;
}

export interface GameState {
  players: { [id: string]: Player };
  objects: { [id: string]: GameObject };
  status: Status;
}

const makeResource = (definition: ResourceDefinition): GameObject => ({
  id: v4(),
  x: random(0, 1000),
  y: random(0, 1000),
  resourceType: definition.type,
  health: definition.maxHealth,
  channeling: null,
});

const makeResourceReq = (): ResourceRequirement => ({
  quantity: 0,
  quantityRequired: random(1, 10),
  resourceType: ResourceType.MUSHROOM,
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
      redTeam: [makeResourceReq()],
      blueTeam: [makeResourceReq()],
      won: false,
    },
  };
  times(20, () => makeResource(MushroomResource)).forEach(
    (item) => (init.objects[item.id] = item)
  );

  return init;
};
