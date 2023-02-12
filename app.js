const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const path = require("path");

let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const startDBAndInitialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started running at http://localhost:3000");
    });
  } catch (e) {
    process.exit(1);
  }
};

startDBAndInitialize();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API 1 GET Method
app.get("/players/", async (request, response) => {
  const playerQuery = `SELECT * FROM cricket_team;`;
  const playerResult = await db.all(playerQuery);
  response.send(
    playerResult.map((each) => convertDbObjectToResponseObject(each))
  );
});

//API 2 POST Method
app.post("/players/", async (request, response) => {
  const queryDetails = request.body;
  const { playerName, jerseyNumber, role } = queryDetails;
  const addQueryPlayer = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}',
        ${jerseyNumber},
        '${role}');`;
  await db.run(addQueryPlayer);
  response.send("Player Added to Team");
});

//API 3 GET Method
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};
  `;
  const playerResult = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerResult));
});

//API 4 PUT Method
app.put("/players/:playerId/", async (request, response) => {
  const updatedQuery = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = updatedQuery;
  const updatePlayerDetails = `
  UPDATE cricket_team 
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API 5 DELETE Method
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team
            WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
