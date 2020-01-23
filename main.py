from flask import Flask, render_template, url_for, request, redirect
from psycopg2 import IntegrityError

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


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


@app.route("/signup", methods=['GET', 'POST'])
def signup():
    """
    Users may sign up and create their account for SharpBoards.
    :return: Opens new page, and creates SQL entry.
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        password_confirmation = request.form['confirm_password']
        user_already_registered = data_handler.is_user_already_registered(username)
        try:
            if user_already_registered != 0:
                passwords_matching = data_handler.confirm_password(password, password_confirmation)
                if passwords_matching:
                    data_handler.register_user(username, password)
                return redirect('/login')
        except IntegrityError:
            return render_template('signup.html')
    return render_template("signup.html")


@app.route("/login", methods=['GET', 'POST'])
def login():
    """
    Already registered users may log in with their username and password on a new page.
    :return: Opens a new page and forwards the user to main page afterwards.
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db_password = data_handler.get_password_from_db(username)
        if password == db_password['password']:
            return redirect('/')
    return render_template("login.html")


if __name__ == '__main__':
    main()
