import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export function printShelves(shelves) {
  console.log("Current shelves:");
  shelves.forEach((shelf, index) => {
    if (shelf.length === 0) console.log(`\tShelf ${index + 1} is empty`);
    else console.log(`\tShelf ${index + 1}: ${shelf.join(", ")}`);
  });
  console.log("\n\n");
}

/**
 * Considering that we deal with the shelves as 2D stacks
 * When moving a cat from a shelf to another, we need to ensure that
 * the target position is empty and the source position has a cat.
 * When moving a cat, it moves all cats that have the same color
 * in the top of the stack to the top of the target shelf.
 * At the end, when moving a cat, we need to update the shelves accordingly. 
 * If not, we should return an error message.
 * @param {number} source_shelf 
 * @param {number} target_shelf
 * @param {number} height
 * @param {Array<Array<number>>} shelves
 */
export function moveCats(source_shelf, target_shelf, height, shelves) {
  // Check if the source position has a cat
  if (shelves[source_shelf].length === 0) {
    throw new Error("No cat at the source position");
  }
  const source_cat = shelves[source_shelf].at(-1);
  const cats_to_move = [];
  // Get all cats of the same color at the top of the source shelf
  while (shelves[source_shelf].length > 0 
    && shelves[source_shelf].at(-1) === source_cat) {
    cats_to_move.push(shelves[source_shelf].pop());
  }
  // Check if the target position has enough space
  if (cats_to_move.length > height - shelves[target_shelf].length) {
    throw new Error("Target position does not have enough space");
  }
  // Move the cats to the target position
  shelves[target_shelf].push(...cats_to_move);
}

export function isShelvesValid(height, shelves) {
  // Considering each value of a shelf a color of a cat
  // Check if the quantity of cats of each color 
  // is divisible by the length of a shelf
  const colorCounts = shelves
    .flat()
    .reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});
  return Object.values(colorCounts).every(count => count % height === 0);
}

export function isGameFinished(height, shelves) {
  // Check if all shelves are valid and contain the correct number of cats
  return isShelvesValid(height, shelves) 
    && shelves.every(shelf => shelf.length === 0 // Or the shelf is empty
      || (shelf.length === height && shelf.every(cat => cat === shelf[0]))); // Or the shelf is full of cats from the same color
}

function initializeShelves(game) {
  const {shelves, colors, height, quantity} = game;
  // Initialize shelves with random colors
  for (let i = 0; i < quantity; i++) {
    const color = Math.floor(Math.random() * colors) + 1;
    let placed = false;
    while (!placed) {
      const shelfIndex = Math.floor(Math.random() * shelves.length);
      if (shelves[shelfIndex].length < height) {
        shelves[shelfIndex].push(color);
        placed = true;
      }
    }
  }
  return shelves;
}

async function startGame() {
  console.log("Starting the game...");
  const game = {
    shelves: [
      [1, 2, 3],
      [1, 3, 2],
      [1, 2, 3],
      [],
      []
    ],
    colors: 3,
    height: 3,
    quantity: 5
  }
  const game_shelves = game.shelves;
  printShelves(game_shelves);
  const rl = createInterface({ input, output });

  try {
    // Start the game loop or any other game logic here
    // For example, you could implement user input handling to move cats between shelves
    while (!isGameFinished(game.height, game_shelves)) {
      const sourceShelf = await rl.question(`Enter the source shelf (1-${game.quantity}): `);
      const targetShelf = await rl.question(`Enter the target shelf (1-${game.quantity}): `);
      moveCats(Number(sourceShelf) - 1, Number(targetShelf) - 1, game.height, game_shelves);
      printShelves(game_shelves);
    }
    console.log("Congratulations! You've completed the game!");
  }
  catch (error) {
    console.error("An error occurred:", error);
  } finally {
    rl.close(); // Ensure the readline interface is closed
  }
}

startGame();
