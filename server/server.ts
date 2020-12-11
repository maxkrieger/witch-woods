import { Socket, Server } from "socket.io";
import express from "express";
import gamestate, {
  Facing,
  GameObject,
  GameState,
  InventoryEntry,
  InventoryEntryI,
  makePlayer,
  resourceTypes,
  Team,
} from "../src/gamestate";
import { stringify } from "uuid";
import { partition } from "lodash";

const server = express();

const http = server.listen(6660);

const io = new Server(http, {
  cors: {
    origin: [
      "http://localhost:8080",
      "https://witchy-woods.netlify.app",
      "http://witchy-woods.netlify.app",
    ],
    methods: ["GET", "POST"],
  },
  serveClient: false,
});

console.log(`server running on 6660`);

const rooms: { [id: string]: GameState } = {};

rooms["room1"] = gamestate();

setInterval(() => {
  Object.entries(rooms).forEach(([id, room]: [string, GameState]) => {
    Object.values(room.objects).forEach((resource: GameObject) => {
      if (resource.channeling !== null) {
        if (resource.health > 0) {
          rooms[id].objects[resource.id].health--;
          io.to(id).emit("gameState", rooms[id]);
        } else {
          const playerID = rooms[id].objects[resource.id].channeling as string;
          const matchingResourceIdxInInv = rooms[id].players[
            playerID
          ].inventory.findIndex(
            (inv) =>
              inv !== null &&
              (inv as InventoryEntryI).resourceType === resource.resourceType
          );
          if (matchingResourceIdxInInv > -1) {
            (rooms[id].players[playerID].inventory[
              matchingResourceIdxInInv
            ] as InventoryEntryI).quantity++;
          } else if (rooms[id].players[playerID].inventory.length < 4) {
            const firstNull = rooms[id].players[playerID].inventory.findIndex(
              (en) => en === null
            );
            if (firstNull > -1) {
              rooms[id].players[playerID].inventory[firstNull] = {
                quantity: 1,
                resourceType: resource.resourceType,
              };
            } else {
              rooms[id].players[playerID].inventory.push({
                quantity: 1,
                resourceType: resource.resourceType,
              });
            }
          } else {
            // inventory full!
            return;
          }
          delete rooms[id].objects[resource.id];
          io.to(id).emit("removeResource", resource.id);
          io.to(id).emit("gameState", rooms[id]);
        }
      } else {
        if (resource.health < resourceTypes[resource.resourceType].maxHealth) {
          rooms[id].objects[resource.id].health++;
          io.to(id).emit("gameState", rooms[id]);
        }
      }
    });
  });
}, 250);

const balancedNextTeam = (roomid: string) => {
  const [reds, blues] = partition(
    Object.values(rooms[roomid].players),
    (player) => player.team === Team.RED
  );
  return reds.length > blues.length ? Team.BLUE : Team.RED;
};

io.on("connection", (socket: Socket) => {
  socket.on("join", ({ name }: { name: string }) => {
    const playerInit = makePlayer(name, balancedNextTeam("room1"));
    rooms["room1"].players[playerInit.id] = playerInit;
    socket.join("room1");
    socket.emit("myPlayer", playerInit);
    io.to("room1").emit("gameState", rooms["room1"]);
    socket.on(
      "move",
      ({
        x,
        y,
        facing,
        moving,
      }: {
        x: number;
        y: number;
        facing: Facing;
        moving: boolean;
      }) => {
        rooms["room1"].players[playerInit.id].x = x;
        rooms["room1"].players[playerInit.id].y = y;
        rooms["room1"].players[playerInit.id].moving = moving;
        rooms["room1"].players[playerInit.id].facing = facing;
        io.to("room1").emit("gameState", rooms["room1"]);
      }
    );
    socket.on(
      "channelResource",
      ({ id, channeling }: { id: string; channeling: boolean }) => {
        if (!(id in rooms["room1"].objects)) {
          return;
        }
        if (channeling && rooms["room1"].objects[id].channeling === null) {
          rooms["room1"].objects[id].channeling = playerInit.id;
        } else if (
          !channeling &&
          rooms["room1"].objects[id].channeling === playerInit.id
        ) {
          rooms["room1"].objects[id].channeling = null;
        }
      }
    );
    socket.on("dumpItems", () => {
      rooms["room1"].players[playerInit.id].inventory.forEach(
        (invEntry, idx) => {
          if (invEntry === null) {
            return;
          }
          const inv = invEntry as InventoryEntryI;
          const matchingResourceIdx = rooms["room1"].status[
            playerInit.team
          ].findIndex(({ resourceType }) => resourceType === inv.resourceType);
          if (matchingResourceIdx > -1) {
            const matchingResourceType =
              rooms["room1"].status[playerInit.team][matchingResourceIdx];
            const remainingNeeded =
              matchingResourceType.quantityRequired -
              matchingResourceType.quantity;
            if (remainingNeeded > 0) {
              const remainingGiven = Math.min(remainingNeeded, inv.quantity);
              (rooms["room1"].players[playerInit.id].inventory[
                idx
              ] as InventoryEntryI).quantity -= remainingGiven;
              rooms["room1"].status[playerInit.team][
                matchingResourceIdx
              ].quantity += remainingGiven;
              if (
                (rooms["room1"].players[playerInit.id].inventory[
                  idx
                ] as InventoryEntryI).quantity === 0
              ) {
                rooms["room1"].players[playerInit.id].inventory[idx] = null;
              }
              io.to("room1").emit("gameState", rooms["room1"]);
            }
          }
        }
      );
    });
    socket.on("disconnect", () => {
      delete rooms["room1"].players[playerInit.id];
      io.to("room1").emit("removePlayer", playerInit.id);
    });
  });
});
