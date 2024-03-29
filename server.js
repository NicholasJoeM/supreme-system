const express = require("express");
const path = require("path");
const bots = require("./src/charData");
const shuffle = require("./src/shuffle");

const playerRecord = {
  wins: 0,
  losses: 0,
};
const app = express();

app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Add up the total health of all the robots
const calculateTotalHealth = (robots) =>
  robots.reduce((total, { health }) => total + health, 0);

// Add up the total damage of all the attacks of all the robots
const calculateTotalAttack = (robots) =>
  robots
    .map(({ attacks }) =>
      attacks.reduce((total, { damage }) => total + damage, 0)
    )
    .reduce((total, damage) => total + damage, 0);

// Calculate both players' health points after the attacks
const calculateHealthAfterAttack = ({ playerDuo, compDuo }) => {
  const compAttack = calculateTotalAttack(compDuo);
  const playerHealth = calculateTotalHealth(playerDuo);
  const playerAttack = calculateTotalAttack(playerDuo);
  const compHealth = calculateTotalHealth(compDuo);

  return {
    compHealth: compHealth - playerAttack,
    playerHealth: playerHealth - compAttack,
  };
};

app.get("/api/robots", (req, res) => {
  try {
    res.status(200).send(bots);
  } catch (error) {
    console.error("ERROR GETTING CHARACTERS", error);
    res.sendStatus(400);
  }
});

app.get("/api/robots/shuffled", (req, res) => {
  try {
    let shuffled = shuffle(bots);
    res.status(200).send(shuffled);
  } catch (error) {
    console.error("ERROR GETTING SHUFFLED CHARACTERS", error);
    res.sendStatus(400);
  }
});

app.post("/api/duel", (req, res) => {
  try {
    const { compDuo, playerDuo } = req.body;

    const { compHealth, playerHealth } = calculateHealthAfterAttack({
      compDuo,
      playerDuo,
    });

    // comparing the total health to determine a winner
    if (compHealth > playerHealth) {
      playerRecord.losses += 1;
      res.status(200).send("BABBLING FOOL!");
    } else {
      playerRecord.wins += 1;
      res.status(200).send("EXISTENTIAL VICTORIOUSNESS!");
    }
  } catch (error) {
    console.log("ERROR DUELING", error);
    res.sendStatus(400);
  }
});

app.get("/api/player", (req, res) => {
  try {
    res.status(200).send(playerRecord);
  } catch (error) {
    console.log("ERROR GETTING PLAYER STATS", error);
    res.sendStatus(400);
  }
});

// ...

app.put("/api/player", (req, res) => {
  try {
    const { wins, losses } = req.body;
    playerRecord.wins = wins;
    playerRecord.losses = losses;
    res.status(200).send(playerRecord);
  } catch (error) {
    console.log("ERROR UPDATING PLAYER STATS", error);
    res.sendStatus(400);
  }
});

app.delete("/api/player", (req, res) => {
  try {
    playerRecord.wins = 0;
    playerRecord.losses = 0;
    res.status(200).send(playerRecord);
  } catch (error) {
    console.log("ERROR DELETING PLAYER STATS", error);
    res.sendStatus(400);
  }
});

// ...


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

