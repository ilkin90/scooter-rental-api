
CREATE TABLE IF NOT EXISTS scooters(
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    battery_level INTEGER DEFAULT 100 CHECK(battery_level >= 0 AND battery_level <= 100),
    status VARCHAR(20) DEFAULT 'available' CHECK(status in('available','in_use','maintenance')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);