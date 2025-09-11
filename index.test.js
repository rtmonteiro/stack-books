import { describe, it } from 'node:test';
import { isShelvesValid, printShelves, moveCats } from './index.js';
describe('Shelves', () => {
    it('are valid', (t) => {
        // Branco 1
        // Vermelho 2
        // Ocre 3
        // Azul 4
        // Laranja 5
        // Roxo 6
        // Rosa 7
        // Amarelo 8
        // Preto 9
        // const shelves = [
        //     [1, 2, 3, 4, 5],
        //     [5, 5, 5, 6, 7],
        //     [6, 2, 4, 7, 3],
        //     [8, 6, 7, 7, 9],
        //     [8, 3, 9, 8, 5],
        //     [1, 9, 2, 4, 2],
        //     [9, 2, 1, 4, 1],
        //     [8, 3, 6, 6, 8],
        //     [3, 1, 4, 7, 9],
        //     [],
        //     []
        // ];
        const {shelves, height} = {
            shelves: [
                [1, 1, 1],
                [2, 3, 2],
                [3, 3, 2]
            ],
            colors: 3,
            height: 3,
            quantity: 3
        };
        t.assert.ok(isShelvesValid(height, shelves));
    });

    it('are invalid', (t) => {
        const {shelves, height} = {
            shelves: [
                [1, 2, 3],
                []
            ],
            colors: 3,
            height: 3,
            quantity: 2
        };
        t.assert.ok(!isShelvesValid(height, shelves));
    });

    it('moves a cat', (t) => {
        const {shelves, height} = {
            shelves: [
                [1, 1, 1],
                [2, 3, 2],
                [3, 3, 2],
                []
            ],
            colors: 3,
            height: 3,
            quantity: 4
        };
        printShelves(shelves);
        moveCats(0, 3, height, shelves);
        printShelves(shelves);
        t.assert.ok(isShelvesValid(height, shelves));
    });

    it('moves a cat', (t) => {
        const {shelves, height} = {
            shelves: [
                [1, 1, 1],
                [2, 3, 2],
                [3, 3, 2],
                []
            ],
            colors: 3,
            height: 3,
            quantity: 4
        };
        printShelves(shelves);
        moveCats(0, 3, height, shelves);
        printShelves(shelves);
        t.assert.ok(isShelvesValid(height, shelves));
    });
});
