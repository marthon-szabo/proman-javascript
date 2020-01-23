// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        eventListeners.buttonCreateBoard();
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
            table.insertAdjacentHTML("beforeend", templates.board(board.id, board.title));
            dom.loadColumns(board.id, function() {
                dom.loadCards(board.id);
            });
            eventListeners.toggleBoard(board.id);
            eventListeners.addCardBtn(board.id);
            eventListeners.addColumnBtn(board.id);
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
                columnPlace.insertAdjacentHTML("beforeend", templates.column(column.id, column.title))
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
            insertHere.insertAdjacentHTML("beforeend", templates.card(card.id, card.title, card.text))
        }
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    temporaryCard: function(columnId){
        document.querySelector(`[data-column-id="${columnId}"]`).firstElementChild.insertAdjacentHTML(
            "afterend",
            `<div class="card-composer" id="temporary" data-column-id="${columnId}">
                    <textarea name="composer-title">Enter the card's title here</textarea>
                    <textarea name="composer-text"></textarea>         
                    <button>Save</button>
                    </div>`
        );
        eventListeners.forTemporaryElement("card"); //forTemporaryCard()
    },
    insertCard: function(columnId, cardId, title, text){
        document.querySelector(`[data-column-id="${columnId}"] > .board-column-content`).insertAdjacentHTML(
            "beforeend", templates.card(cardId, title, text)
        )
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

let eventListeners = {
    buttonCreateBoard: function() {
        document.querySelector("#create-board").addEventListener("click", function (event) {
            document.querySelector("#boards").insertAdjacentHTML("afterbegin",
                `<div id="temporary">
                    <label for="inp-new-board">Enter the board's title:</label>
                    <input id="inp-new-board" >
                    <button>save</button>
                    </div>`);
            event.stopPropagation();
            eventListeners.forTemporaryElement("board");
        })
    },
    forTemporaryElement: function(elementType){
        let tempObj = document.querySelector("#temporary");
        document.addEventListener("click", function(event){
            if (tempObj !== event.target.parentElement){ //outside of tempObj clicks
                tempObj.remove();
            } else if (event.target === tempObj.querySelector("button")) { // save button
                switch(elementType){
                    case "card":
                        let title = tempObj.querySelector(`[name="composer-title"]`).value;
                        let text = tempObj.querySelector(`[name="composer-text"]`).value;
                        let columnId = tempObj.dataset.columnId;
                        dataHandler.createNewCard(title, text, columnId, function(response){ // the newly created ID comes back in the response
                            if (response === "writing failed" ){
                                alert("some error occurred. Data is not accepted.")
                            } else {
                               dom.insertCard(columnId, response, title, text)
                            }
                         });
                        break;
                    case "board":
                        let boardTitle = tempObj.querySelector("input").value;
                        dataHandler.createNewBoard(boardTitle, function(response){
                            document.querySelector("#boards").insertAdjacentHTML("afterbegin",
                                templates.board(response, boardTitle));
                            dom.loadColumns(response);
                            eventListeners.addCardBtn(response);
                            eventListeners.toggleBoard(response);
                        });
                        break;
                    case "column":
                        let columnTitle = tempObj.querySelector("input").value;
                        let boardId = tempObj.dataset.boardId;
                        dataHandler.createNewColumn(columnTitle, boardId, function(response){
                            document.querySelector(`[data-board-id="${boardId}"] > .board-columns`).insertAdjacentHTML(
                                "beforeend",
                                templates.column(response, columnTitle)
                            )
                        })
                }
                tempObj.remove()
            }
            document.removeEventListener("click", arguments.callee)
        })
    },
    toggleBoard: function(element_id){
        //let boardSelector = document.querySelectorAll(".board-toggle");
        //for (let boardheader of boardSelector) {
        let element = document.querySelector(`[data-board-id="${element_id}"]`);
        let boardheader = element.querySelector(".board-toggle");
        boardheader.addEventListener("click", function(event){
            event.currentTarget.firstChild.classList.toggle("fa-chevron-up");
            event.currentTarget.parentElement.nextElementSibling.classList.toggle("flex");
            event.currentTarget.parentElement.nextElementSibling.classList.toggle("hidden");
        })

    },
    addCardBtn: function(element_id){
        let element = document.querySelector(`[data-board-id="${element_id}"]`);
        let button = element.querySelector(".board-add");
        button.addEventListener("click", function(event){
            let actualBoard = event.target.parentElement.parentElement;
            let actualColId = actualBoard.querySelector(".board-column").dataset.columnId; // this is the 1st col. "New"
            event.stopPropagation();
            dom.temporaryCard(actualColId);
        })
    },
    addColumnBtn: function(elementId){
        let element = document.querySelector(`[data-board-id="${elementId}"]`);
        let button = element.querySelector('.board-add-col');
        button.addEventListener("click", function(event){
            element.querySelector(".board-header").insertAdjacentHTML("afterend",
                `<div id="temporary" data-board-id="${elementId}">
                    <label for="inp-new-column">Enter the column's title:</label>
                    <input id="inp-new-column" >
                    <button>save</button>
                    </div>`
            );
            event.stopPropagation();
            eventListeners.forTemporaryElement("column");
        });
    },

};

let templates = {
    card: (cardId, title, text) => {
        return `<div class="card" data-card-id="${cardId}">
        <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
        <div class="card-title">${title}</div>
        <div class="card-content">${text === null ? "" : text}</div>
        </div>`
    },
    board: (boardId, boardTitle) => {
        return `<section class="board" data-board-id="${boardId}">
        <div class="board-header">
            <span class="board-title">${boardTitle}</span>
            <button class="board-add">Add Card</button>
            <button class="board-add-col">New Column</button>
            <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
        </div>
        <div class="board-columns flex">                    
        </div>
        </section>`
    },
    column: (columnId, columnTitle) => {
        return `<div class="board-column" data-column-id="${columnId}">
                    <div class="board-column-title">${columnTitle}</div>
                    <div class="board-column-content"></div>
                </div>`
    }

};
