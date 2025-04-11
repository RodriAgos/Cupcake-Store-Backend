CREATE DATABASE cupcake_store;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer'))
);

-- Modificada tabla cupcakes, se llama products y ahora e incluye stock.
CREATE TABLE products (
    cupcake_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    image TEXT,
    rating REAL,
    bgColor TEXT
);

CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    cupcake_id INTEGER REFERENCES cupcakes(cupcake_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (user_id, cupcake_id)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'canceled')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_details (
    order_detail_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    cupcake_id INTEGER REFERENCES cupcakes(cupcake_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    cupcake_id INTEGER REFERENCES cupcakes(cupcake_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(50),
    UNIQUE (user_id, cupcake_id)
);

CREATE OR REPLACE FUNCTION set_default_role()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users) = 0 THEN
        NEW.role := 'admin';
    ELSE
        NEW.role := 'customer';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_default_role
BEFORE INSERT ON users
FOR EACH ROW
WHEN (NEW.role IS NULL)
EXECUTE FUNCTION set_default_role();
