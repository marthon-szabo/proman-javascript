// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it contains the boards and their cards and statuses. It is not called from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())  // parse the response as JSON
        .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        // it is not called from outside
        // sends the data to the API, and calls callback function

        fetch(url,  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, // multipart/form-data
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(json_response => callback(json_response));
    },
    init: function () {
    },
    getBoards: function (callback) {
        // the boards are retrieved and then the callback function is called with the boards

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data = response;
            callback(response);
        });
    },
    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
    },
    getStatuses: function (boardId, callback) {
        this._api_get(`/get-statuses/${boardId}`, (response) => {
            this._data = response;
            callback(response)
        })
        // the statuses are retrieved and then the callback function is called with the statuses
    },
    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getCardsByBoardId: function (boardId, callback) {
        this._api_get(`/get-cards/${boardId}`, (response) =>{
            this._data = response;
            callback(response)
        })
        // the cards are retrieved and then the callback function is called with the cards
    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
    },
    createNewBoard: function (boardTitle, callback) {
        let boardData = {
            "type": "board",
            "title": boardTitle
        }
        this._api_post("/create-new", boardData, (response) => {
            callback(response)
        })
        // creates new board, saves it and calls the callback function with its data
    },
    createNewCard: function (cardTitle, cardText, statusId, callback) { //boardId not necessary
        // creates new card, saves it and calls the callback function with its data
        let cardData = {
            "type": "card",
            "title": cardTitle,
            "foreign_id": statusId,
            "text": cardText
        };
        this._api_post("/create-new", cardData, (response) => {
            callback(response)
        })
    },
    createNewColumn: function (columnTitle, boardId, callback){
        let columnData = {
            "type": "column",
            "title": columnTitle,
            "foreign_id": boardId
        };
        this._api_post("/create-new", columnData, (response) => {
            callback(response)
        })
    },
    renameSendData(value, elementType, elementId, callback){
        let data = {
            "type": elementType,
            "id": elementId,
            "text": value,
        };
        this._api_post("/rename", data, (response) => {
            callback(response)
        })
    },
    // here comes more features
};
