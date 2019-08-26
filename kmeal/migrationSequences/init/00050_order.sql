CREATE TABLE IF NOT EXISTS kmeal."order" (
    "order_id" INTEGER NOT NULL PRIMARY KEY,
    "buyer" CHAR(12) NOT NULL REFERENCES kmeal.account(owner),
    "arbitrator" CHAR(12) NOT NULL REFERENCES kmeal.account(owner),
    "restaurant_id" INTEGER NOT NULL REFERENCES kmeal.restaurant(restaurant_id),
    "price" TEXT NOT NULL,
    "instructions" TEXT,
    "created_at" TIMESTAMP NOT NULL,
    "created_block" BIGINT NOT NULL,
    "created_trx" TEXT NOT NULL,
    "created_eosacc" TEXT NOT NULL,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp NOT NULL
);CREATE TABLE IF NOT EXISTS kmeal."order_status" (
    "order_id" INTEGER NOT NULL PRIMARY KEY REFERENCES kmeal.order(order_id),
    "order_status" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL
);CREATE TABLE IF NOT EXISTS kmeal."order_detail" (
    "order_id" INTEGER,
    "listing_id" INTEGER REFERENCES kmeal.listing(listing_id),
    "qty" INTEGER NOT NULL,
    "ordered_price" INTEGER NOT NULL,
    "listing_type" CHAR NOT NULL,
    "instructions" TEXT
);CREATE TABLE IF NOT EXISTS kmeal."dporder" (
    "dporder_id" INTEGER NOT NULL PRIMARY KEY,
    "order_id" INTEGER REFERENCES kmeal.order(order_id),
    "buyer" TEXT NOT NULL REFERENCES kmeal.account(owner),
    "restaurant_id" INTEGER NOT NULL REFERENCES kmeal.restaurant(restaurant_id),
    "listing_id" INTEGER NOT NULL REFERENCES kmeal.listing(listing_id),
    "bid_price" TEXT NOT NULL,
    "instructions" TEXT,
    "created_at" TIMESTAMP NOT NULL,
    "created_block" BIGINT NOT NULL,
    "created_trx" TEXT NOT NULL,
    "created_eosacc" TEXT NOT NULL,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp NOT NULL
);