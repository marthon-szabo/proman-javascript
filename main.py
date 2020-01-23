from flask import Flask, render_template, url_for, request, jsonify
from util import json_response
import data_handler


app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


def check_element(data):
    for key, value in data.items():
        data_handler.delete_element(str(key), int(value))


@app.route("/delete-element", methods=["GET", "POST"])
def delete_item():
    data = request.get_json()
    check_element(data)
    # TODO: Mergeing: dev/create


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


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
