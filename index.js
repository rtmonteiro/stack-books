#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import terminalKit from 'terminal-kit';

const term = terminalKit.terminal;

/**
 * Format a number with leading zero if it's less than 10
 * @param {number} num 
 * @returns {string}
 */
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
export function printShelves(height, shelves) {
  // const maxHeight = Math.max(...shelves.map(shelf => shelf.length));
  const maxHeight = height;
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
 * Print the shelves in sequence as stacks besides one another
 * with terminal-kit, where each color is represented by a different color
 * @param {Array<Array<number>>} shelves 
 * @example
 * printShelvesTerminalKit([
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ]);
 * @returns {void}
 */
function printShelvesTerminalKit(height, quantity,shelves) {
  term.clear();
  // print the lines from top to bottom
  for (let i = height; i >= 0; i--) {
    for (let j = 0; j < quantity + 1; j++) {
      term.moveTo(j * 3 + 1, height - i);
      term.white('|');
    }
  }
  // print the spacer line
  term.moveTo(1, height + 1);
  term('-'.repeat(quantity * 3 + 1) + '\n');
  // print the index of each shelf
  for (let i = 0; i < quantity; i++) {
    term.moveTo(i * 3 + 2, height + 2);
    term.white(formatNumberWithLeadingZero(i + 1));
  }
  // print the lines for the index of each shelf
  for (let i = 0; i < quantity + 1; i++) {
    term.moveTo(i * 3 + 1, height + 2);
    term.white('|');
  }
  // print the books in each shelf from bottom to top
  for (let i = 0; i < quantity; i++) {
    for (let j = 0; j < shelves[i].length; j++) {
      term.moveTo(i * 3 + 2, height - j);
      term.color(shelves[i][j])(formatNumberWithLeadingZero(shelves[i][j]));
    }
  }
  // move the cursor to the bottom of the terminal
  term.moveTo(1, height + 2);
  term('\n');
}

/**
 * Considering that we deal with the shelves as 2D stacks
 * When moving a book from a shelf to another, we need to ensure that
 * the target position is empty and the source position has a book.
 * When moving a book, it moves all books that have the same color
 * in the top of the stack to the top of the target shelf.
 * At the end, when moving a book, we need to update the shelves accordingly. 
 * If not, we should return an error message.
 * @param {number} source_shelf 
 * @param {number} target_shelf
 * @param {number} height
 * @param {Array<Array<number>>} shelves
 */
export function moveBooks(source_shelf, target_shelf, height, shelves) {
  // Check if the source position has a book
  if (shelves[source_shelf].length === 0) {
    throw new Error("No book at the source position");
  }
  const source_book = shelves[source_shelf].at(-1);
  const books_to_move = [];
  // Get all books of the same color at the top of the source shelf
  while (shelves[source_shelf].length > 0
    && shelves[source_shelf].at(-1) === source_book) {
    books_to_move.push(shelves[source_shelf].pop());
  }
  // Check if the target position is not empty and has the same color as the source_book
  if (shelves[target_shelf].length > 0 && shelves[target_shelf].at(-1) !== source_book) {
    throw new Error("Target position has a different color");
  }
  // Check if the target position has enough space
  if (books_to_move.length > height - shelves[target_shelf].length) {
    throw new Error("Target position does not have enough space");
  }
  // Move the books to the target position
  shelves[target_shelf].push(...books_to_move);
}

export function isShelvesValid(height, shelves) {
  // Considering each value of a shelf a color of a book
  // Check if the quantity of books of each color 
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
  // Check if all shelves are valid and contain the correct number of books
  return isShelvesValid(height, shelves)
    && shelves.every(shelf => shelf.length === 0 // Or the shelf is empty
      || (shelf.length === height && shelf.every(book => book === shelf[0]))); // Or the shelf is full of books from the same color
}

function initializeShelves(game) {
  const { colors, height, quantity } = game;
  // Initialize shelves with random colors

  // Create the set of available books to be sorted
  const availableBooks = [];
  for (let i = 0; i < colors; i++) {
    availableBooks.push(...Array(height).fill(i + 1));
  }
  // Shuffle the available books
  for (let i = availableBooks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableBooks[i], availableBooks[j]] = [availableBooks[j], availableBooks[i]];
  }
  // Distribute the available books into the shelves
  const shelves = new Array(quantity);
  for (let i = 0; i < quantity; i++) {
    shelves[i] = availableBooks.splice(0, height);
  }
  return shelves;
}

export async function startGame() {
  console.log("Starting the game...");
  const game = {
    colors: 6,
    height: 5,
    quantity: 9
  }
  const game_shelves = initializeShelves(game);
  printShelvesTerminalKit(game.height, game.quantity, game_shelves);
  const rl = createInterface({ input, output });

  try {
    while (!isGameFinished(game.height, game_shelves)) {
      const sourceShelf = await rl.question(`Enter the source shelf (1-${game.quantity}): `);
      const targetShelf = await rl.question(`Enter the target shelf (1-${game.quantity}): `);
      moveBooks(Number(sourceShelf) - 1, Number(targetShelf) - 1, game.height, game_shelves);
      printShelvesTerminalKit(game.height, game.quantity, game_shelves);
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
