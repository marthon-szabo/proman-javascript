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

def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards



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





>>>>>>> delete_public_table
