/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: Tetrilapse
@author: 
@tags: []
@addedOn: 2024-00-00
*/

const player = "p"
const blockSprite = "b"
setLegend(
  [ player, bitmap`
................
................
.......000......
.......0.0......
......0..0......
......0...0.0...
....0003.30.0...
....0.0...000...
....0.05550.....
......0...0.....
.....0....0.....
.....0...0......
......000.......
......0.0.......
.....00.00......
................` ],
  [ blockSprite, bitmap`
FFFFFFFFFFFFFFFF
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
F66666666666666F
FFFFFFFFFFFFFFFF`]
)

setSolids([])

let level = 0
const levels = [
  map`
..........
..........
..........
..........
..........
..........
..........
..........
..........
..........`,
  map`
..........
..........
..........
..........
..........
..........
..........
....p.....`
]

setMap(levels[level])

setPushables({
  [ blockSprite ]: [ blockSprite ]
})

class Block {
  constructor(length, position) {
    this.length = length; // Length of the block
    this.position = position; // Starting position
    this.width = 3; // Initial x-offset
    this.height = 0; // Initial y-offset
    this.sprites = []; // To track sprite positions
  }

  initializeSprites() {
    for (let i = 0; i < this.length; i++) {
      const x = i + this.width;
      const y = this.height;
      addSprite(x, y, blockSprite);
      this.sprites.push({ x, y }); // Store the coordinates manually
    }
    console.log("Initialized block at position:", this.sprites);
  }

  move(dx, dy, floor=9) {
    // Compute new anchor position
    const newWidth = this.width + dx;
    const newHeight = this.height + dy;
  
    // Check for collisions or boundaries
    for (let i = 0; i < this.sprites.length; i++) {
      const newX = newWidth + i; // Calculate new x-position based on index
      const newY = newHeight;
  
      // Check if the target tile is occupied
      const tile = getTile(newX, newY);
  
      // Ignore tiles occupied by the current block itself
      const isSelfOccupied = this.sprites.some(sprite => sprite.x === newX && sprite.y === newY);
      if (tile && tile[0] && !isSelfOccupied) {
        if (tile[0].type == player){
          addText("Game Over!", {y: 3, color: color`3`});
          return true
        }else{
          // console.log("Collision detected at x=${newX}, y=${newY}");
          return false; // Abort move if collision occurs
        }
      }
      if (newY > floor || newX > 9 || newX < 0) return false; // Out of bounds
    }
  
    // Clear old tiles
    for (let i = 0; i < this.sprites.length; i++) {
      // console.log("Clearing sprite at:", this.sprites[i]);
      clearTile(this.sprites[i].x, this.sprites[i].y);
    }
  
    // Update anchor point
    this.width = newWidth;
    this.height = newHeight;
  
    // Recalculate and redraw sprites
    this.sprites = [];
    for (let i = 0; i < this.length; i++) {
      const newX = this.width + i;
      const newY = this.height;
      this.sprites.push({ x: newX, y: newY });
      addSprite(newX, newY, blockSprite);
    }
  
    // console.log("Moved block to new position:", this.sprites);
    return true;
  }

  control() {
    this.initializeSprites(); // Initialize the block

    // Falling logic
    const falling = setInterval(() => {
      if (!this.move(0, 1)) {
        blocks.push(this)
        if (this.height == 0) {
          addText("Loading map...", {y: 3})
          level++
          setTimeout(() => {
            setMap(levels[level])
            clearText()
            const dodging = setInterval(()=>{
              if (index < blocks.length) {
                console.log("Dodging block at index=${index}");
                blocks[index].dodge();
                index++;
              } else {
                clearInterval(dodging);
              }
            },1000)
            const clearing = setTimeout(()=>{
              const repeat = setInterval(()=>{
                const tiles = []
                for (let i = 0; i<10; i++){
                  const tile = getTile(i, 7)[0]
                  if (tile && tile.type == blockSprite){
                    tiles.push(tile)
                  }
                }
                for (let tile of tiles){
                  tile.remove()
                }
                for (let sprite of getAll(blockSprite, player)){
                  if (sprite.y < this.height){
                    sprite.y++
                    console.log(sprite.y)
                  }
                }
                if (tilesWith(blockSprite).length == 0){
                  addText("You win!", {y:3, color: color`4`})
                }
              }, 1000)
            }, 6000)
          },1000)
        }else{
          const tiles = []
          for (let i = 0; i<10; i++){
            const tile = getTile(i, this.height)[0]
            if (tile){
              tiles.push(tile)
            }
          }
          if (tiles.length == 10){
            for (let tile of tiles){
              tile.remove()
            }
            for (let sprite of getAll(blockSprite)){
              if (sprite.y < this.height){
                sprite.y++
                console.log(sprite.y)
              }
            }
          }
        }
        
        clearInterval(falling); // Stop if the block can't move down
        // console.log("Block stopped at height: ${this.height}");
        if (level == 0){
          currentBlock = new Block(Math.floor(Math.random() * 7) + 1, 3);
          currentBlock.control(); // Start a new block
        }
      }
    }, 1000);

  }

  initializeMeteors() {
    this.sprites = [];
    for (let i = 0; i < this.length; i++) {
      const x = i + this.width;
      const y = 0; // Start at the top
      addSprite(x, y, blockSprite);
      this.sprites.push({ x, y }); // Store the new top position
    }
    // console.log("Initialized meteor at top position:", this.sprites);
  }

  
  dodge() {
    this.height = 0; // Reset block height to the top
    this.initializeMeteors(); // Initialize the block at the top
  
    // Falling logic
    const falling = setInterval(() => {
      // Move all parts of the block down
      this.move(0,1,7)
  
      // Check for collisions with the player
      
    }, 500);
  }

}

let index = 0
const blocks = []
// Start the first block
let currentBlock = new Block(Math.floor(Math.random() * 7) + 1, 3);
currentBlock.control();

onInput("s", () => {
  if (level == 0) currentBlock.move(0, 1)
}); // Move down
onInput("a", () => {
  if (level == 0){
    currentBlock.move(-1, 0)
  }else{
    const playerSprite = getFirst(player);
    if (!getTile(playerSprite.x - 1, playerSprite.y).length) {
      playerSprite.x -= 1; // Move left
    }
  }
});
onInput("d", () => {
  if (level == 0){
    currentBlock.move(1, 0)
  }else{
    const playerSprite = getFirst(player);
    if (!getTile(playerSprite.x + 1, playerSprite.y).length) {
      playerSprite.x += 1; // Move right
    }
  }
});
onInput("w", () => {
  if (level == 1){
    const playerSprite = getFirst(player);
    if (!getTile(playerSprite.x, playerSprite.y - 1).length) {
      playerSprite.y -= 1; // Jump up
      setTimeout(() => {
        if (!getTile(playerSprite.x, playerSprite.y + 1).length) {
          playerSprite.y += 1; // Gravity pulls the player back
        }
      }, 200);
    }
  }
});

function clearRow(row = 9) {
  const tiles = [];
  for (let i = 0; i < 10; i++) {
    const tile = getTile(i, row)[0];
    if (tile) tiles.push(tile);
  }

  if (tiles.length === 10) {
    // Remove full row
    tiles.forEach(tile => tile.remove());

    // Drop blocks above
    blocks.forEach(block => {
      block.sprites.forEach(sprite => {
        if (sprite.y < row) {
          clearTile(sprite.x, sprite.y);
          sprite.y++; // Drop sprite
          addSprite(sprite.x, sprite.y, blockSprite);
        }
      });
      block.height++;
    });
  }
}

