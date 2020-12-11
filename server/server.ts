import { Socket, Server } from "socket.io";
import express from "express";
import gamestate, {
  Facing,
  GameObject,
  GameState,
  makePlayer,
  resourceTypes,
  Team,
} from "../src/gamestate";
import { stringify } from "uuid";

const server = express();

const http = server.listen(6660);

const io = new Server(http, {
  cors: {
    origin: ["http://localhost:8080"],
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

io.on("connection", (socket: Socket) => {
  socket.on("join", ({ name, team }: { name: string; team: Team }) => {
    const playerInit = makePlayer(name, team);
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
    socket.on("disconnect", () => {
      delete rooms["room1"].players[playerInit.id];
      io.to("room1").emit("removePlayer", playerInit.id);
    });
  });
});
