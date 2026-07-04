-- USERS TABLE
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    role ENUM('guest', 'host') DEFAULT 'guest',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROPERTIES TABLE
CREATE TABLE properties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    host_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price_per_night DECIMAL(10,2) NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    beds INT DEFAULT 1,
    guests_allowed INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city),
    INDEX idx_price (price_per_night),
    FULLTEXT idx_search (title, description),
    CONSTRAINT chk_price CHECK (price_per_night > 0),
    CONSTRAINT chk_guests CHECK (guests_allowed > 0)
);

-- PROPERTY IMAGES TABLE
CREATE TABLE property_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- AVAILABILITY TABLE
CREATE TABLE availability (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_property_date (property_id, date),
    INDEX idx_date (date)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    guest_id BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_guests INT DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_checkin (check_in),
    INDEX idx_checkout (check_out),
    CONSTRAINT chk_dates CHECK (check_out > check_in)
);