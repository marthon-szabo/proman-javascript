// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let table = document.querySelector("#boards");
        for (let board of boards){
            table.insertAdjacentHTML("beforeend",
                `<section class="board" data-board-id="${board.id}">
            <div class="board-header">
                <span class="board-title">${board.title}</span>
                <button class="board-add">Add Card</button>
                <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
            </div>
            <div class="board-columns">
                <div class="board-column">
                    <div class="board-column-title">New</div>
                    <div class="board-column-content"></div>
                </div>
            </div>
            </section>`


            );
            dom.loadCards(board.id)

        }
        /*let boardList = '';

        for(let board of boards){
            boardList += `
                <li>${board.title}</li>
            `;
        }

        const outerHtml = `
            <ul class="board-container">
                ${boardList}
            </ul>
        `;

        let boardsContainer = document.querySelector('#boards');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);

         */
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function(cards){
            dom.showCards(cards, boardId)
        })
        // retrieves cards and makes showCards called
    },
    showCards: function (cards, boardId) {
        let board = document.querySelector(`[data-board-id="${boardId}"]`).querySelector(".board-column-content");
        for (let card of cards){
            board.insertAdjacentHTML("beforeend",
                `<div class="card" data-card-id="${card.id}">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">${card.title}</div>
                </div>`
            )
        }
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features
};
