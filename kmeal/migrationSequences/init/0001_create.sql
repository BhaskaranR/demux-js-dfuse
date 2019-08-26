CREATE TABLE ${schema~}._index_state (
    id serial PRIMARY KEY,
    block_number integer NOT NULL,
    block_hash text NOT NULL,
    is_replay boolean NOT NULL
);CREATE TABLE ${schema~}._block_number_txid (
    block_number integer PRIMARY KEY,
    txid bigint NOT NULL
);