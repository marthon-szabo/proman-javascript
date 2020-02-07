import connection
import persistence
import bcrypt
from psycopg2 import sql


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


@connection.connection_handler
def get_boards(cursor):
    cursor.execute("""
    SELECT * FROM boards""")
    """
    Gather all boards
    :return:
    """
    return cursor.fetchall()


@connection.connection_handler
def get_cards_for_board(cursor, board_id):
    cursor.execute("""
        SELECT cards.id, cards.title, cards.text, cards.col_id FROM cards
        INNER JOIN columns ON cards.col_id = columns.id
        INNER JOIN boards ON columns.board_id = boards.id
        WHERE boards.id = %(board_id)s;
    """, {"board_id": board_id})

    return cursor.fetchall()


@connection.connection_handler
def get_statuses_aka_columns(cursor, board_id):
    cursor.execute("""
        SELECT * FROM columns
        WHERE board_id = %(board_id)s
    """, {"board_id": board_id})
    return cursor.fetchall()


@connection.connection_handler
def write_item(cursor, type, title, foreign_id=None, text=None, status=None, user_id=None):
    if type == "card":
        try:
            cursor.execute("""
                INSERT INTO cards(title, text, col_id)
                VALUES (%(title)s, %(text)s, %(col_id)s)
                RETURNING id;
            """, {"title": title, "text": text, "col_id": foreign_id}
            )
            return cursor.fetchone()
        except:
            return False

    elif type == "board":
        try:
            cursor.execute("""
                INSERT INTO boards (title, status, user_id)
                VALUES (%(title)s, %(status)s, %(user_id)s)
                RETURNING id;
            """, {"title": title, "status": status, "user_id": user_id}
           )
            board_id = cursor.fetchone()

            for title in ["New", "In progress", "Testing", "Done"]:
                cursor.execute("""
                    INSERT INTO columns (title, board_id)
                    VALUES (%(title)s, %(board_id)s)
                """, {"title": title, "board_id": board_id["id"]})

            return board_id
        except:
            return False

    elif type == "column":
        try:
            cursor.execute("""
                INSERT INTO columns (title, board_id)
                VALUES (%(title)s, %(board_id)s)
            """, {"title": title, "board_id": foreign_id})
            return cursor.fetchone()
        except:
            return False


def confirm_password(password, password_confirmation):
    if password == password_confirmation:
        passwords_matching = True
    else:
        passwords_matching = False
    return passwords_matching


@connection.connection_handler
def register_user(cursor, username, password):
    cursor.execute("""
                    INSERT INTO users (username, password) VALUES 
                    ( %(username)s, %(password)s);
                    """, {'username': username, 'password': password})


@connection.connection_handler
def is_user_already_registered(cursor, username):
    cursor.execute("""
                    SELECT id FROM users WHERE username = %(username)s
                    """, {'username': username})
    registered_user_id = cursor.fetchone()
    if registered_user_id != 0:
        return registered_user_id
    """
    else:
        registered_user_id = 0
        return registered_user_id
    """


@connection.connection_handler
def get_hashed_password(cursor, username):
    cursor.execute("""
                    SELECT password FROM users
                    WHERE username = %(username)s;                    
                    """, {'username': username})
    hashed_pw = cursor.fetchone()
    return hashed_pw


@connection.connection_handler
def hash_password(raw_password):
    hashed_bytes = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')


@connection.connection_handler
def verify_password(raw_password, hashed_password):
    hashed_bytes_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(raw_password.encode('utf-8'), hashed_bytes_password)


@connection.connection_handler
def get_password_from_db(cursor, username):
    cursor.execute("""
                    SELECT password FROM users
                    WHERE username = %(username)s;
                    """, {"username": username})
    password_from_db = cursor.fetchone()
    return password_from_db


@connection.connection_handler
def delete_element(cursor, element, id):
    if 'board' in element:
        cursor.execute("""
                        DELETE FROM boards
                        WHERE id = %(id)s;
                        """,
                       {'id': id})
    elif 'col' in element:
        cursor.execute("""
                        DELETE FROM columns
                        WHERE id = %(id)s;
                        """,
                       {'id': id})

    elif 'card' in element:
        cursor.execute("""
                                DELETE FROM cards
                                WHERE id = %(id)s;
                                """,{'id': id})

@connection.connection_handler
def rename_element_new_title(cursor, id, type, text):
    tablename = ""
    if type == "board":
        tablename = "boards"
    elif type == "column":
        tablename = "columns"
    elif type == "card":
        tablename = "cards"

    cursor.execute(sql.SQL("""
        UPDATE {0}
        SET title = %(text)s
        WHERE id = %(id)s
        RETURNING title
    """).format(sql.Identifier(tablename)), {"text": text, "id": id})

    return cursor.fetchone()

@connection.connection_handler
def set_new_col_for_card(cursor, column_id, card_id):
    cursor.execute("""
    UPDATE cards
    SET col_id = %(col_id)s
    WHERE id = %(card_id)s
    """, {"col_id": column_id, "card_id": card_id})
