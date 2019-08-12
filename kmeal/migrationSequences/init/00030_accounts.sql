CREATE TABLE IF NOT EXISTS "kmeal"."account" (
    "owner" CHAR(12) NOT NULL PRIMARY KEY,
    "balance" DECIMAL NOT NULL,
    "account_type" CHAR (1) DEFAULT 'C' NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "created_block" BIGINT NOT NULL,
    "created_trx" TEXT NOT NULL,
    "created_eosacc" TEXT NOT NULL,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp NOT NULL
);CREATE TABLE IF NOT EXISTS "kmeal"."restaurant" (
    "restaurant_id" INTEGER NOT NULL PRIMARY KEY,
    "yelp_id" VARCHAR (60),
    "owner" CHAR(12) NOT NULL REFERENCES "kmeal".account (owner),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "latitude" FLOAT NOT NULL,
    "longitude" FLOAT NOT NULL,
    "location" GEOGRAPHY (Point),
    "address" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "rating" INTEGER,
    "timeofoperation" VARCHAR(60) NOT NULL,
    "isactive" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "created_block" BIGINT NOT NULL,
    "created_trx" VARCHAR(200) NOT NULL,
    "created_eosacc" VARCHAR(200) NOT NULL,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp NOT NULL
);CREATE TABLE IF NOT EXISTS "kmeal"."restaurant_categories" (
    "restaurant_id" INTEGER NOT NULL REFERENCES "kmeal".restaurant (restaurant_id),
    "category" TEXT NOT NULL
);