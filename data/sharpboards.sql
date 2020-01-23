ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS pk_user_id CASCADE ;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS pk_board_id CASCADE ;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS fk_user_id CASCADE ;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS pk_card_id CASCADE ;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS fk_col_id CASCADE ;
ALTER TABLE IF EXISTS ONLY public.columns DROP CONSTRAINT IF EXISTS pk_column_id CASCADE;
ALTER TABLE IF EXISTS ONLY public.columns DROP CONSTRAINT IF EXISTS fk_board_id CASCADE ;


DROP TABLE IF EXISTS users;
CREATE TABLE users (
    ID serial,
    username varchar unique NOT NULL ,
    password varchar
);

DROP TABLE IF EXISTS boards;
CREATE TABLE boards (
    ID serial,
    title varchar,
    status varchar,
    user_id integer
);

DROP TABLE IF EXISTS cards;
CREATE TABLE cards (
    ID serial,
    title varchar,
    text varchar,
    col_id integer
);

DROP TABLE IF EXISTS columns;
CREATE TABLE columns (
    ID serial,
    title varchar,
    text varchar,
    board_id integer
);

ALTER TABLE ONLY users
ADD CONSTRAINT pk_user_id PRIMARY KEY (ID);

ALTER TABLE ONLY boards
ADD CONSTRAINT pk_board_id PRIMARY KEY (ID),
ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(ID) ON DELETE CASCADE;


ALTER TABLE ONLY columns
ADD CONSTRAINT pk_column_id PRIMARY KEY (ID),
ADD CONSTRAINT fk_board_id FOREIGN KEY (board_id) REFERENCES boards(ID) ON DELETE CASCADE;


ALTER TABLE ONLY cards
ADD CONSTRAINT pk_card_id PRIMARY KEY (ID),
ADD CONSTRAINT fk_col_id FOREIGN KEY (col_id) REFERENCES columns(ID) ON DELETE CASCADE;


