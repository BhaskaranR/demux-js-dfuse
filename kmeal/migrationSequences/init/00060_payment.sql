CREATE TABLE IF NOT EXISTS kmeal."menu_book" (
    "menu_book_id" SERIAL PRIMARY KEY,
    "restaurant_id" INTEGER NOT NULL REFERENCES kmeal.restaurant ("restaurant_id"),
    "menu_book" VARCHAR (100) NOT NULL,
    "sort_order" INTEGER NOT NULL
);CREATE TABLE kmeal."menu_book_section" (
    "section_id" SERIAL PRIMARY KEY,
    "section_name" VARCHAR (100) NOT NULL,
    "menu_book_id" INTEGER NOT NULL REFERENCES kmeal.menu_book ("menu_book_id"),
    "sort_order" INTEGER NOT NULL
);CREATE TABLE IF NOT EXISTS kmeal."item" (
    "item_id" SERIAL NOT NULL PRIMARY KEY,
    "item_name" varchar (50) NOT NULL,
    "description" TEXT NOT NULL,
    "photo" varchar (50) NOT NULL,
    "spicy_level" INTEGER,
    "vegetarian" INTEGER,
    -- vegan, vegetarian
    "cooking_time" INTEGER,
    -- time in minutes
    "restaurant_id" INTEGER NOT NULL REFERENCES kmeal.restaurant (restaurant_id),
    "created_at" TIMESTAMP NOT NULL,
    "created_block" BIGINT NOT NULL,
    "created_trx" TEXT NOT NULL,
    "created_eosacc" TEXT NOT NULL,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp NOT NULL
);CREATE TABLE IF NOT EXISTS kmeal."item_section" (
    "item_id" INTEGER NOT NULL REFERENCES kmeal.item ("item_id"),
    "section_id" INTEGER NOT NULL REFERENCES kmeal.menu_book_section (section_id),
    "sort_order" INTEGER,
    PRIMARY KEY (item_id, section_id)
);CREATE TABLE IF NOT EXISTS kmeal."item_types" (
    "item_id" INTEGER NOT NULL REFERENCES kmeal.item ("item_id"),
    "item_type" VARCHAR (50) NOT NULL
);-- list type regular, dynamically priced, combo menu
CREATE TABLE IF NOT EXISTS kmeal."listing" (
    "listing_id" SERIAL PRIMARY KEY,
    "restaurant_id" INTEGER NOT NULL REFERENCES kmeal.restaurant (restaurant_id),
    "item_id" INTEGER NOT NULL REFERENCES kmeal.item ("item_id"),
    "list_price" DECIMAL NOT NULL,
    "list_type" CHAR (1) DEFAULT 'R' NOT NULL,
    "min_price" DECIMAL,
    "quantity" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "start_time" VARCHAR (10),
    "end_time" VARCHAR (10),
    "isrecurring" CHAR (1),
    "sliding_rate" DECIMAL,
    "isactive" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP,
    "created_block" BIGINT,
    "created_trx" TEXT,
    "created_eosacc" TEXT,
    "_dmx_created_at" TIMESTAMP DEFAULT current_timestamp
);CREATE TABLE IF NOT EXISTS kmeal."listing_item_sides" (
    "listing_id" INTEGER NOT NULL REFERENCES kmeal.listing ("listing_id"),
    "item_name" VARCHAR (100) NOT NULL,
    "group" VARCHAR (50),
    "max_selection" INTEGER,
    "list_price" DECIMAL
);