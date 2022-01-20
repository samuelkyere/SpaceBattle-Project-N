// Superclass
class AlutaShip {
  
    constructor(name) {
        this.name = name;
  }
  /**
   * show ship's stats
   */
  showStats() { console.log(this.nameId)
    document.getElementById(this.nameId).innerHTML = `${this.name}`;
    document.getElementById(this.statsId).innerHTML = `Hull : ${this.hull}${
      this.shield ? '(' + this.shield + ')' : ''
    }<br>FirePower : ${this.firepower}<br>Accuracy : ${this.accuracy}`;
}
}
// USS Space Ship class
class USS extends AlutaShip {
    /**
     * The USS Schwarzenegger has the following properties:
     *  - hull      : 20
     *  - firepower : 5
     *  - accuracy  : 0.7
     *  - shield    : 10
     * @param {string} name
     * @return {USS}
     */
    constructor(name) {
        super(name);
        this.hull = 20;
        this.shield = 10;
        this.firepower = 5;
        this.accuracy = 0.7;
        this.nameId = 'playerName';
        this.statsId = 'playerStats';
        this.showStats();
    }
    /**
     * Attack the alien
     * @param {obj} enemy 
     * @returns {number} alien hull 
     */

  attack(enemy) {
    if (Math.random() < this.accuracy) {
      enemy.hull -= this.firepower;
      enemy.showStats();
      Battle.log(`${this.name} hit ${enemy.name} [${this.firepower}]`);
    } else {
      Battle.log(`{this.name} missed`);
    }
    return enemy.hull;
  }
}
// Alien Aluta Ship class
class Alien extends AlutaShip {
  /**
   * The alien ship has the following ranged properties determined randomly;
   * - hull      : between 3 and 6
   * - firepower : between 2 and 4
   * - accuracy  : between 0.6 and 0.8
   * @param {string} name
   * @return {Alien}
   */
  constructor(name) {
    super(name);
    this.hull = 3 + Math.round((6 - 3) * Math.random());
    this.firepower = 2 + Math.round((4 - 2) * Math.random());
    this.accuracy = 0.6 + Math.round((0.8 - 0.6) * Math.random() * 10) / 10;
    this.nameId = 'enemyName';
    this.statsId = "enemyStats";
  }
  /**
     * Attack the player
     * @param {obj} player
     * @return {number} player's ship hull
     */
   attack(player) {
    if (Math.random() < this.accuracy) {
        // calculate absorbed damage
        const absorb = Math.round(Math.min(this.firepower, player.shield) * Math.random());
        // decrease player's hull
        player.hull -= (this.firepower - absorb);
        // decrease player's shield 
        player.shield -= absorb;
        player.showStats();
        Battle.log(`${this.name} hit ${player.name} [${this.firepower}], shield absorbed [${absorb}]`);
    } else {
        Battle.log(`${this.name} missed`);
    }
    return player.hull;
}
 
  /**
   * Generate random number of ships to attack Earth
   * @param {number} min
   * @param {number} max
   * @return {Alien[]} Array of 'Alien' objects
   */
  static createAzuma(min, max) {
    const numAlienShips = min + Math.round((max - min) * Math.random());
    const azuma = [];
    for (let i = 0; i < numAlienShips; i++) {
      azuma.push(new Alien(`Alien#${i + 1}`));
    }
    return azuma;
  }
}

// Battle
class Battle {
  constructor(player, enemies) {
    this.player = player;
    this.enemies = enemies;
    this.round = 0;
    this.status = "inProgress";
  }

    // static function to log into console
    static log(str) {
        console.log(str);
    }

  // static function to log into console
  static log(str) {
    console.log(str);
    alert(str);
  }
  /**
   * @param{string} message // prompt message
   * @param {string} options // prompt options
   * @return {string} // user input
   */
  prompt(message, options) {
    let input;
    do {
      input = prompt(message, options.join("/"));
      if (input === null) {
        return null;
      } else if (options.toString().includes(input.toLowerCase())) {
      } else if (options.includes(input.toLowerCase())) {
        return input.toLowerCase();
      }
    } while (input !== null);
  }
  startBattle() {
    // Ask the player to choose the target
    new Promise((resolve) =>
        setTimeout(() => 
            resolve(
                this.prompt(`The aliens send ${this.enemies.length} ships to attack Earth` + '\n'
                    + this.enemies
                        .map((enemy, index) => `[${index + 1}] ${enemy.name} (H: ${enemy.hull}, F: ${enemy.firepower}, A: ${enemy.accuracy})` + (((index + 1) % 2 !== 0) ? '      ' : '\n'))
                        .join('')
                    + '\n\nChoose the target'
                    , this.enemies.map((enemy, index) => `${index + 1}`)
            )
        ), 100))
    // Get the chosen target to start the battle
    .then((targetIndex) => this.nextTarget(this.enemies.splice(Number(targetIndex) - 1, 1)[0]))

}

  nextTarget(target) {
    this.target = target;
    this.target.showStats();

    // use Promise to support delaying of user prompt
    new Promise((resolve) =>
      // use a timer to ask the user for a delay and get enough time to update DOM
      setTimeout(() =>resolve(this.prompt("[Current Health: " + this.player.hull + "] [Target's Health: " +
                target.hull +
                "] [Enemies Remaining: " +
                (this.enemies.length + 1) +
                "]\n\nDo you want to attack the alien ship?",
              ["attack", "retreat"]
            )
          ),
        100
      )
    ).then((playerAction) => {
      // If player selected 'retreat' set status to 'playerRetreat' else fight the current target
      this.status =
        playerAction === null ? "playerRetreat" : this.fighttarget();
      switch (this.status) {
        case "nextTarget":
          this.nextTarget(this.enemies.pop());
          return;
        case "playerWon":
          Battle.alert(`:::[ ${this.player.name} WON]:::`);
          if (
            confirm(
              "Another horde of alien ships is coming!\n\n Are you ready for the next battle?"
            )
          ) {
            startNewBattle(this.player);
            return;
          }
          break;
        case "playerLose":
          Battle.alert(`:::[GAME OVER ]:::`);
          break;
        default:
          return;
      }
      if (confirm("Do you want to start a new game?")) {
        startNewGame();
      }
    });
  }
  fighttarget() {
    while (this.target.hull > 0) {
      Battle.log(`:::[ROUND ${++this.round} ]:::`);

      // player attacks, check if target is destroyed
      if (this.player.attack(this.target) <= 0) {
        // if target is destroyed, then switch to the next target
        // If no target left, then player won
        Battle.log(`${this.target.name} is Destroyed!`);
        if (this.enemies.length > 0) {
          // this.nextTarget(this.enemies.pop());
          return "nextTarget";
        } else {
          return "playerWon";
        }
        // target attacks, check if player's ship is destroyed
      } else if (this.target.attack(this.player) <= 0) {
        // if player ship is destroyed, then player lose
        return "playerLose";
       }

            // aliens can attack more than one at a time
            this.enemies
                // put each element in the array in an object, and give it a random key
                .map((value) => ({ value, rand: Math.random() }))
                // filter using the random key
                .filter((enemy)=>enemy.rand < 0.1)
                // unmap to get the original objects
                .map(({ value }) => value)
                // each of filtered aliens attacks
                .forEach((attacker)=>{
                    if (attacker.attack(this.player) <= 0) {
                        // if player ship is destroyed, then player lose
                        return 'playerLose';
    }
  })
}
  }
}
// Start New Game
function startNewGame() {
  const player = new USS("USS Schwarzenegger");
  startNewBattle(player);
}
// Start New Battle
function startNewBattle(player) {
  const enemies = Alien.createAzuma(6, 10);
  const battle = new Battle(player, enemies);
  battle.startBattle();
}
window.addEventListener("load", startNewGame);
