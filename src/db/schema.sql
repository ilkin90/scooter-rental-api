CREATE TABLE IF NOT EXISTS scooters(
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    battery_level INTEGER DEFAULT 100 CHECK(battery_level >= 0 AND battery_level <= 100),
    status VARCHAR(20) DEFAULT 'available' CHECK(status in('available','in_use','maintenance')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK(balance >= 0.00),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallets_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_transactions(
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK(amount > 0.00),
    transaction_type VARCHAR(20) CHECK(transaction_type in('TOP_UP', 'PAYMENT', 'REFUND')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- DEFAULT ƏLAVƏ EDİLDİ

    CONSTRAINT fk_transactions_wallets
    FOREIGN KEY (wallet_id)
    REFERENCES wallets(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rentals(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scooter_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_minutes INTEGER,
    total_cost DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'active' CHECK(status in('active','completed','cancelled')),

    CONSTRAINT fk_rentals_scooter
    FOREIGN KEY (scooter_id)
    REFERENCES scooters(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_rentals_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_rental_per_user
ON rentals(user_id) WHERE status = 'active';