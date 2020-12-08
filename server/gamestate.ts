export type ResourceType = "mushroom" | "gem";

export type Team = "RED" | "BLUE";

export interface InventoryEntry {
  resourceType: ResourceType;
  quantity: number;
}

export interface Player {
  name: string;
  id: string;
  x: number;
  y: number;
  team: Team;
  inventory: InventoryEntry[];
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  resourceType: ResourceType;
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

export default (): GameState => ({
  players: {},
  objects: {},
  status: {
    redTeam: [],
    blueTeam: [],
    won: false,
  },
});
