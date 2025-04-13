CREATE DATABASE cupcake_store;

CREATE TABLE admin_control (
    has_admin BOOLEAN DEFAULT FALSE
);

INSERT INTO admin_control (has_admin) VALUES (FALSE);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT NULL CHECK (role IN ('admin', 'customer'))
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
    cupcake_id INTEGER REFERENCES products(cupcake_id) ON DELETE CASCADE,
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
    cupcake_id INTEGER REFERENCES products(cupcake_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    cupcake_id INTEGER REFERENCES products(cupcake_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(50),
    UNIQUE (user_id, cupcake_id)
);

CREATE OR REPLACE FUNCTION set_default_role()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT has_admin FROM admin_control LIMIT 1) = FALSE THEN
        NEW.role := 'admin';
        UPDATE admin_control SET has_admin = TRUE;
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

CREATE OR REPLACE FUNCTION safe_insert_user()
RETURNS TRIGGER AS $$
BEGIN
    LOCK TABLE admin_control IN EXCLUSIVE MODE;

    IF (SELECT has_admin FROM admin_control LIMIT 1) = FALSE THEN
        NEW.role := 'admin';
        UPDATE admin_control SET has_admin = TRUE;
    ELSE
        NEW.role := 'customer';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_default_role ON users;

CREATE TRIGGER assign_default_role_safe
BEFORE INSERT ON users
FOR EACH ROW
WHEN (NEW.role IS NULL)
EXECUTE FUNCTION safe_insert_user();