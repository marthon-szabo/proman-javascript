from flask import Flask, render_template, url_for, request
from util import json_response

import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route("/get-statuses/<int:board_id>")
@json_response
def get_statuses(board_id: int):
    return data_handler.get_statuses_aka_columns(board_id)


@app.route("/create-new", methods=["POST", "GET"])
@json_response
def receive_data_to_database():
    if request.method == "POST":
        item = request.get_json()
        try:
            text = item["text"]
        except:
            text = None
        success = data_handler.write_item(item["type"], item["title"], item["foreign_id"], text)
        return success["id"] if success else "writing failed"

    print("this is not supposed to run, GET")
    return None


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
