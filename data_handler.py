import connection

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
                                """,
                       {'id': id})