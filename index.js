import * as readline from 'node:readline/promises';
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
    console.error("No cat at the source position");
    return;
  }
  const source_cat = shelves[source_shelf].at(-1);
  const cats_to_move = [];
  // Get all cats of the same color at the top of the source shelf
  while (shelves[source_shelf].length > 0 && shelves[source_shelf].at(-1) === source_cat) {
    cats_to_move.push(shelves[source_shelf].pop());
  }
  // Check if the target position has enough space
  if (cats_to_move.length > height - shelves[target_shelf].length) {
    console.error("Target position does not have enough space");
    return;
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
      []
    ],
    colors: 3,
    height: 3,
    quantity: 4
  }
  const game_shelves = game.shelves;
  printShelves(game_shelves);
  // Start the game loop or any other game logic here
  // For example, you could implement user input handling to move cats between shelves
  while (isShelvesValid(game.height, game_shelves)) {
    const sourceShelf = 0;
    const targetShelf = 3;
    moveCats(sourceShelf, targetShelf, game.height, game_shelves);
    printShelves(game_shelves);
  }
}

startGame();
