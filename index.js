import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function formatNumberWithLeadingZero(num) {
  return String(num).padStart(2, '0');
}

/**
 * Print the shelves in sequence as stacks besides one another
 * @param {Array<Array<number>>} shelves 
 * @example
 * printShelves([
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ]);
 * @returns {void}
 */
export function printShelves(shelves) {
  const maxHeight = Math.max(...shelves.map(shelf => shelf.length));
  for (let i = maxHeight - 1; i >= 0; i--) {
    let row = "";
    for (const shelf of shelves) {
      row += `| ${shelf[i] === undefined ? "  " : formatNumberWithLeadingZero(shelf[i])} `;
    }
    console.log(row + "|");
  }
  console.log("-".repeat(shelves.length * 5 + 1));
  // print the index of each shelf
  for (let i = 0; i < shelves.length; i++) {
    process.stdout.write(`| ${formatNumberWithLeadingZero(i + 1)} `);
  }
  console.log("|\n");
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
  // Check if the target position is not empty and has the same color as the source_cat
  if (shelves[target_shelf].length > 0 && shelves[target_shelf].at(-1) !== source_cat) {
    throw new Error("Target position has a different color");
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
  const { shelves, colors, height, quantity } = game;
  // Initialize shelves with random colors
  // Create the set of available cats to be sorted
  const availableCats = [];
  for (let i = 0; i < colors; i++) {
    availableCats.push(...Array(height).fill(i + 1));
  }
  // Shuffle the available cats
  for (let i = availableCats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCats[i], availableCats[j]] = [availableCats[j], availableCats[i]];
  }
  // Distribute the available cats into the shelves
  for (let i = 0; i < shelves.length; i++) {
    shelves[i] = availableCats.splice(0, height);
  }
  return shelves;
}

export async function startGame() {
  console.log("Starting the game...");
  const game = {
    shelves: [
      [1, 2, 3, 4, 5],
      [5, 5, 5, 6, 7],
      [6, 2, 4, 7, 3],
      [8, 6, 7, 7, 9],
      [8, 3, 9, 8, 5],
      [1, 9, 2, 4, 2],
      [9, 2, 1, 4, 1],
      [8, 3, 6, 6, 8],
      [3, 1, 4, 7, 9],
      [],
      []
    ],
    colors: 9,
    height: 5,
    quantity: 11
  }
  const game_shelves = game.shelves;
  printShelves(game_shelves);
  const rl = createInterface({ input, output });

  try {
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
