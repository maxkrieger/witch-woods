import { Socket, Server } from "socket.io";
import express from "express";
import gamestate, {
  Ability,
  abilityCooldowns,
  EIceTrapped,
  Facing,
  GameObject,
  GameState,
  InventoryEntry,
  InventoryEntryI,
  makePlayer,
  makeTrap,
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

setInterval(
  () =>
    Object.entries(rooms).forEach(([roomID, room]: [string, GameState]) => {
      let update = false;
      Object.entries(room.players).forEach(([playerID, player]) => {
        if (player.effect.kind !== "normal") {
          if (player.effect.remaining <= 0) {
            rooms[roomID].players[playerID].effect = { kind: "normal" };
          } else {
            (rooms[roomID].players[playerID].effect as EIceTrapped).remaining--;
          }
          update = true;
        }
        player.inventory.forEach((entry, idx) => {
          if (entry !== null && entry.cooldown !== 0) {
            rooms[roomID].players[playerID].inventory[idx]!.cooldown--;
            update = true;
          }
        });
      });
      if (update) {
        io.to(roomID).emit("gameState", rooms[roomID]);
      }
    }),
  1100
);

setInterval(() => {
  Object.entries(rooms).forEach(([id, room]: [string, GameState]) => {
    Object.values(room.objects).forEach((resource: GameObject) => {
      if (resource.channeling !== null) {
        if (resource.health > 0) {
          rooms[id].objects[resource.id].health--;
          io.to(id).emit("gameState", rooms[id]);
        } else {
          const playerID = rooms[id].objects[resource.id].channeling as string;
          if (!(playerID in rooms[id].players)) {
            rooms[id].objects[resource.id].channeling = null;
            io.to(id).emit("gameState", rooms[id]);
            return;
          }
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
          } else if (
            rooms[id].players[playerID].inventory.filter(
              (item) => item !== null
            ).length < 4
          ) {
            const firstNull = rooms[id].players[playerID].inventory.findIndex(
              (en) => en === null
            );
            if (firstNull > -1) {
              rooms[id].players[playerID].inventory[firstNull] = {
                quantity: 1,
                resourceType: resource.resourceType,
                cooldown: 0,
              };
            } else {
              rooms[id].players[playerID].inventory.push({
                quantity: 1,
                resourceType: resource.resourceType,
                cooldown: 0,
              });
            }
          } else {
            io.to(id).emit("tellMessage", {
              message: "inventory is full!",
              id: playerID,
            });
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
}, 240);

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
        if (!(playerInit.id in rooms["room1"].players)) {
          return;
        }
        rooms["room1"].players[playerInit.id].x = x;
        rooms["room1"].players[playerInit.id].y = y;
        rooms["room1"].players[playerInit.id].moving = moving;
        rooms["room1"].players[playerInit.id].facing = facing;
        io.to("room1").emit("gameState", rooms["room1"]);
      }
    );
    const decrementSpell = (slot: number, ability: Ability): boolean => {
      const slotData = rooms["room1"].players[playerInit.id].inventory[slot];
      if (
        slotData !== null &&
        slotData.cooldown === 0 &&
        resourceTypes[slotData.resourceType].ability === ability
      ) {
        rooms["room1"].players[playerInit.id].inventory[slot]!.quantity--;
        if (
          rooms["room1"].players[playerInit.id].inventory[slot]!.quantity <= 0
        ) {
          rooms["room1"].players[playerInit.id].inventory[slot] = null;
        } else {
          rooms["room1"].players[playerInit.id].inventory[slot]!.cooldown =
            abilityCooldowns[ability];
        }
        return true;
      } else {
        return false;
      }
    };
    socket.on(
      "teleport",
      ({ x, y, slot }: { x: number; y: number; slot: number }) => {
        if (!decrementSpell(slot, Ability.TELEPORT)) {
          return;
        }
        io.to("room1").emit("explode", { x, y });
        const player = rooms["room1"].players[playerInit.id];
        io.to("room1").emit("explode", { x: player.x, y: player.y });
        rooms["room1"].players[playerInit.id].x = x;
        rooms["room1"].players[playerInit.id].y = y;
        io.to("room1").emit("gameState", rooms["room1"]);
      }
    );
    socket.on(
      "placeTrap",
      ({ x, y, slot }: { x: number; y: number; slot: number }) => {
        if (!decrementSpell(slot, Ability.ICE_TRAP)) {
          return;
        }
        const trap = makeTrap(x, y, playerInit.team, playerInit.id);
        rooms["room1"].traps[trap.id] = trap;
        io.to("room1").emit("gameState", rooms["room1"]);
      }
    );
    socket.on("seeingEye", ({ slot }: { slot: number }) => {
      if (!decrementSpell(slot, Ability.SEEING_EYE)) {
        return;
      }
      rooms["room1"].players[playerInit.id].effect = {
        kind: "seeing_eye",
        remaining: 20,
      };
      io.to("room1").emit("gameState", rooms["room1"]);
    });
    socket.on("explode", ({ x, y }: { x: number; y: number }) => {
      io.to("room1").emit("explode", { x, y });
    });
    socket.on(
      "activateTrap",
      ({ player, trap }: { player: string; trap: string }) => {
        const tr = rooms["room1"].traps[trap];
        io.to("room1").emit("explode", { x: tr.x, y: tr.y });
        io.to("room1").emit("removeTrap", trap);
        io.to("room1").emit("tellMessage", {
          message: `${
            rooms["room1"].players[tr.madeBy]
              ? rooms["room1"].players[tr.madeBy].name
              : "another player"
          } trapped you!`,
          id: playerInit.id,
        });
        io.to("room1").emit("tellMessage", {
          message: `you trapped ${rooms["room1"].players[playerInit.id].name}!`,
          id: tr.madeBy,
        });
        delete rooms["room1"].traps[trap];
        rooms["room1"].players[playerInit.id].effect = {
          kind: "ice_trapped",
          remaining: 30,
        };
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
      let dumped = false;
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
              dumped = true;
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
            }
          }
        }
      );
      if (dumped) {
        if (
          !rooms["room1"].status[playerInit.team].find(
            (req) => req.quantityRequired - req.quantity !== 0
          )
        ) {
          io.to("room1").emit("tellMessage", {
            message: `${playerInit.team} team wins!`,
            id: "",
          });
          rooms["room1"].status.state = `ENDED`;
          rooms["room1"].status.winner = playerInit.team;
          io.to("room1").emit("gameState", rooms["room1"]);
          rooms["room1"] = gamestate();
          return;
        }
        io.to("room1").emit("tellMessage", {
          message: `you dropped off items`,
          id: playerInit.id,
        });
        io.to("room1").emit("gameState", rooms["room1"]);
        const player = rooms["room1"].players[playerInit.id];
        io.to("room1").emit("explode", { x: player.x, y: player.y });
      }
    });
    socket.on("disconnect", () => {
      delete rooms["room1"].players[playerInit.id];
      io.to("room1").emit("removePlayer", playerInit.id);
    });
  });
});
