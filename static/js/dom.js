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
            <div class="board-columns flex">                    
            </div>
            </section>`


            );
            dom.loadColumns(board.id, function() {
                dom.loadCards(board.id);
            });

        }
        let boardSelector = document.querySelectorAll(".board-toggle");
        for (let boardheader of boardSelector) {
            boardheader.addEventListener("click", function(event){
                event.currentTarget.firstChild.classList.toggle("fa-chevron-up");
                console.log(event.target.parentElement.nextElementSibling);
                event.currentTarget.parentElement.nextElementSibling.classList.toggle("flex");
                event.currentTarget.parentElement.nextElementSibling.classList.toggle("hidden");
            })
        }
    },
    loadColumns: function(boardId, callback){
        dataHandler.getStatuses(boardId, function(columns){
            dom.showColumns(columns, boardId);
            callback();
        })
    },
    showColumns: function(columns, boardId){
        let columnPlace = document.querySelector(`[data-board-id="${boardId}"]`).querySelector(".board-columns");
        for (let column of columns){
            if (column.board_id === boardId){
                columnPlace.insertAdjacentHTML("beforeend",
                `<div class="board-column" data-column-id="${column.id}">
                    <div class="board-column-title">${column.title}</div>
                    <div class="board-column-content"></div>
                </div>`)
            }
        }
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function(cards){
            dom.showCards(cards)
        })
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        console.log(cards);
        for (let card of cards){
            let insertHere = document.querySelector(`[data-column-id="${card.col_id}"]`).querySelector(".board-column-content");
            //if (card.col_id === boardColumn.dataset.columnId){
                insertHere.insertAdjacentHTML("beforeend",
                `<div class="card" data-card-id="${card.id}">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">${card.title}</div>
                    <div class="card-content">${card.text === null ? "" : card.text}</div>
                    </div>`
                )
           // }
        }
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features
    deleteElement: function (element, childDataset, parentDataset) {
        let parentElement = element.parentNode;
        if (parentElement.dataset[parentDataset] != "0" && element.dataset[childDataset] != "0") {
            switch (parentElement.dataset[parentDataset] === element.dataset[childDataset]) {
                case true:
                    parentElement.innerHTML = "";
                    fetch('/delete-element', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(parentElement.dataset)
                    }).then((parentAndChild) => parentAndChild)

                    //json.stringify(parentElement);
                    //json.stringify(element);


            }

        }

    },

    selectToDelete: function (attribute, childDataset, parentDataset) {
        let element = document.querySelector(`${attribute}`);
        element.addEventListener("click", function () { dom.deleteElement(element, childDataset, parentDataset)} );
    },
};

