import connection
import persistence
import bcrypt


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


def get_boards():
    """
    Gather all boards
    :return:
    """
    return persistence.get_boards(force=True)


@connection.connection_handler
def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards


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
                    """, {'username':username})
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