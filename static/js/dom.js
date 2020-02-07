// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    init: function () {
        eventListeners.buttonCreateBoard();
        eventListeners.renameSelectedElement();
        dragAndDrop.startDragula();
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let table = document.querySelector("#boards");
        for (let board of boards) {
            table.insertAdjacentHTML("beforeend", templates.board(board.id, board.title));
            dom.loadColumns(board.id, function () {
                dom.loadCards(board.id);
                dragAndDrop.pushContainer(".board-column-content")
            });
            eventListeners.toggleBoard(board.id);
            eventListeners.addCardBtn(board.id);
            eventListeners.addColumnBtn(board.id);
            eventListeners.addDelBtn("board", board.id);

        }
    },
    loadColumns: function (boardId, callback) {
        dataHandler.getStatuses(boardId, function (columns) {
            dom.showColumns(columns, boardId);
            callback();
        })
    },
    showColumns: function (columns, boardId) {
        let columnPlace = document.querySelector(`[data-board-id="${boardId}"]`).querySelector(".board-columns");
        for (let column of columns) {
            if (column.board_id === boardId) {
                columnPlace.insertAdjacentHTML("beforeend", templates.column(column.id, column.title))
            }
        }
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(cards)
        })
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        for (let card of cards) {
            let insertHere = document.querySelector(`[data-column-id="${card.col_id}"]`).querySelector(".board-column-content");
            insertHere.insertAdjacentHTML("beforeend", templates.card(card.id, card.title, card.text))
        }
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    temporaryCard: function (columnId) {
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
    insertCard: function (columnId, cardId, title, text) {
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
    deleteElementSecond: function (containerElement) {
        fetch('/delete-element', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(containerElement.dataset)
        })
    },

    selectToDelete: function (attribute, childDataset, parentDataset) {
        let element = document.querySelector(`${attribute}`);
        element.addEventListener("click", function () {
            dom.deleteElement(element, childDataset, parentDataset)
        });
    },
};

let eventListeners = {
    buttonCreateBoard: function () {
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
    forTemporaryElement: function (elementType) {
        let tempObj = document.querySelector("#temporary");
        document.addEventListener("click", function (event) {
            if (!event.target.closest("#temporary")) { //outside of tempObj clicks
                tempObj.remove();
            } else if (event.target === tempObj.querySelector("button")) { // save button
                eventListeners.generateX(elementType);
                tempObj.remove()
            } else {

            }
            document.removeEventListener("click", arguments.callee)
        })
    },
    createCardElement: function () {
        let title = tempObj.querySelector(`[name="composer-title"]`).value;
        let text = tempObj.querySelector(`[name="composer-text"]`).value;
        let columnId = tempObj.dataset.columnId;
        dataHandler.createNewCard(title, text, columnId, function (response) { // the newly created ID comes back in the response
            if (response === "writing failed") {
                alert("some error occurred. Data is not accepted.")
            } else {
                dom.insertCard(columnId, response, title, text)
            }
        });
    },
    createBoardElement: function () {
        let boardTitle = tempObj.querySelector("input").value;
        dataHandler.createNewBoard(boardTitle, function (response) {
            document.querySelector("#boards").insertAdjacentHTML("afterbegin",
                templates.board(response, boardTitle));
            dom.loadColumns(response);
            eventListeners.addCardBtn(response);
            eventListeners.toggleBoard(response);
        });
    },
    createColumnElement: function () {
        let columnTitle = tempObj.querySelector("input").value;
        let boardId = tempObj.dataset.boardId;
        dataHandler.createNewColumn(columnTitle, boardId, function (response) {
            document.querySelector(`[data-board-id="${boardId}"] > .board-columns`).insertAdjacentHTML(
                "beforeend",
                templates.column(response, columnTitle)
            );
            dragAndDrop.pushContainer(`[data-column-id="${response}"] > .board-column-content`);
        });
    },
    generateX() {
        switch (elementType) {
            case "card":
                this.createCardElement();
                break;
            case "board":
                this.createBoardElement();
                break;
            case "column":
                this.createColumnElement();
        }

    },
    toggleBoard: function (element_id) {
        //let boardSelector = document.querySelectorAll(".board-toggle");
        //for (let boardheader of boardSelector) {
        let element = document.querySelector(`[data-board-id="${element_id}"]`);
        let boardheader = element.querySelector(".board-toggle");
        boardheader.addEventListener("click", function (event) {
            event.currentTarget.firstChild.classList.toggle("fa-chevron-up");
            event.currentTarget.parentElement.nextElementSibling.classList.toggle("flex");
            event.currentTarget.parentElement.nextElementSibling.classList.toggle("hidden");
        })

    },
    addCardBtn: function (element_id) {
        let element = document.querySelector(`[data-board-id="${element_id}"]`);
        let button = element.querySelector(".board-add");
        button.addEventListener("click", function (event) {
            let actualBoard = event.target.parentElement.parentElement;
            let actualColId = actualBoard.querySelector(".board-column").dataset.columnId; // this is the 1st col. "New"
            event.stopPropagation();
            dom.temporaryCard(actualColId);
        })
    },
    addColumnBtn: function (elementId) {
        let element = document.querySelector(`[data-board-id="${elementId}"]`);
        let button = element.querySelector('.board-add-col');
        button.addEventListener("click", function (event) {
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
    addDelBtn: function (elementType, elementId) {
        let element = selectors.typeOfElement(elementType, elementId);

        element.addEventListener("click", function (event) {
            if (event.target.matches(".delete-button")) {
                dom.deleteElementSecond(this);
                this.remove();
            }
            if (event.target.matches(".fa-trash-alt")) {
                const elementToRemove = event.target.closest('.board-column, .card');
                dom.deleteElementSecond(elementToRemove);
                elementToRemove.remove()
            }
        })
    },
    // this is not used. Needs to be added to every element. Instead: renameSelectedElement, which is global.
    renameElement: function (elementType, elementId) {
        const element = selectors.typeOfElement(elementType, elementId);

        element.addEventListener("click", function (event) {
            if (event.target.matches("[class*='title']")) {
                let originalValue = event.target.textContent;
                event.target.innerHTML = `<input id="rename" data-type="${elementType}" data-type-id="${elementId}" placeholder="${originalValue}">`;
                event.stopPropagation();
                eventListeners.focusInputField("#rename")
            }
        })
    },
    renameSelectedElement: function () {
        document.addEventListener("click", function (event) {
            // do not let to run if there is another input opened
            if (document.querySelector("#rename")) {
                return
            }
            // get data of clicked element (card, column, board)
            let {elementType, elementId} = selectors.getTypeAndIdByTitle(event.target);


            if (elementId && elementType) {
                let originalValue = event.target.textContent;
                event.target.innerHTML = `<input id="rename" data-type="${elementType}" data-type-id="${elementId}" placeholder="${originalValue}">`;
                event.stopPropagation();
                eventListeners.focusInputField("#rename")
            }
        })
    },
    focusInputField: function (querySelectorTxt) {
        let selectedElement = document.querySelector(querySelectorTxt);
        selectedElement.select();

        document.addEventListener("click", function _listener(event) {
            // outside clicks
            if (event.target !== selectedElement) {
                selectedElement.parentElement.innerHTML = selectedElement.getAttribute("placeholder");
                event.currentTarget.removeEventListener("click", _listener)
            }
            // remaining inside, check for enter key
        });
        selectedElement.addEventListener("keyup", function _sendInput(event) {
            //run only if input is present
            if (!document.querySelector("#rename")) {
                return
            }
            if (event.keyCode === 13) {
                // get value of input, strip whitespace and compare with original
                let userInput = event.target.value.replace(/(^\s+|\s+$)/g, '');
                let originalValue = event.target.getAttribute("placeholder");

                if (userInput === "" || userInput === originalValue) {
                    return
                }
                dataHandler.renameSendData(
                    event.target.value,
                    event.target.dataset.type,
                    event.target.dataset.typeId,
                    function (response) {
                        console.log(response);
                        event.target.parentElement.innerHTML = event.target.value
                    }
                );
            }
        });
    },

};

const selectors = {
    typeOfElement: (elementType, elementId) => (document.querySelector(`[data-${elementType}-id="${elementId}"]`)
    ),
    getTypeAndIdByTitle: function (target) {
        let elementType;
        let elementId;
        if (target.matches("[class~='column-title']")) {
            elementType = "column";
            elementId = target.parentElement.dataset.columnId;
        }
        if (target.matches("[class~='board-title']")) {
            elementType = "board";
            elementId = target.parentElement.parentElement.dataset.boardId;
        }
        if (target.matches("[class~='card-title']")) {
            elementType = "card";
            elementId = target.parentElement.dataset.cardId;
        }
        return {elementType: elementType, elementId: elementId}
    }

};

let dragAndDrop = {
    container: [],
    $All: function (selector) {
        return document.querySelectorAll(selector)
    },
    startDragula: function () {
        dragula(this.container)
            .on('drop', this.onDrop);

    },
    pushContainer: function (selector) {
        let newElements = Array.from(this.$All(selector));
        // spread operator for the values to be pushed, not the array itself
        this.container.push(...newElements);
    },
    onDrop: function (el, target) {
        // keyworded parameters, the called function is destructuring them
        dataHandler.sendDraggedCard({
            cardId: el.dataset.cardId,
            columnId: target.parentElement.dataset.columnId,
            callback: (response) => console.log(response)
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
            <button class="delete-button">Del</button>
            <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
        </div>
        <div class="board-columns flex">                    
        </div>
        </section>`
    },
    column: (columnId, columnTitle) => {
        return `<div class="board-column" data-column-id="${columnId}">
                    <div class="column-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="column-title">${columnTitle}</div>
                    <div class="board-column-content"></div>
                </div>`
    }

};
