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

        let boardList = '';

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
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
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
                    parentElement.dataset[parentDataset] = "0";
                    element.dataset[childDataset] = "0";
                    const parentAndChild = [JSON.stringify(element.dataset), JSON.stringify(parentElement.dataset)]
                    console.log(parentAndChild)

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

