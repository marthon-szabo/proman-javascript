import connection


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
def write_item(cursor, type, title, foreign_id=None, text=None):
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
