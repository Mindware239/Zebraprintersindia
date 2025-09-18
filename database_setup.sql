-- Database setup for zebra_db
-- Run this in phpMyAdmin or MySQL command line

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS zebra_db;
USE zebra_db;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    shortDescription TEXT,
    description TEXT,
    specifications TEXT,
    sku VARCHAR(100) UNIQUE,
    metaKeywords TEXT,
    metaTitle VARCHAR(255),
    metaDescription TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(500),
    pdf VARCHAR(500),
    features JSON,
    inStock BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, slug, category, image, description, features, inStock, rating, reviews) VALUES
('Zebra ZD421', 'zebra-zd421', 'printers', '/api/placeholder/300/200', 'High-performance desktop printer for barcode labels', '["USB & Ethernet", "203 DPI", "4-inch print width"]', TRUE, 4.5, 120),
('Zebra ZT411', 'zebra-zt411', 'printers', '/api/placeholder/300/200', 'Industrial printer for heavy-duty applications', '["Industrial grade", "300 DPI", "6-inch print width"]', TRUE, 4.8, 85),
('Zebra DS2208', 'zebra-ds2208', 'scanners', '/api/placeholder/300/200', 'Handheld barcode scanner with advanced features', '["Wireless connectivity", "Long battery life", "Durable design"]', TRUE, 4.6, 95),
('Zebra TC21', 'zebra-tc21', 'mobile', '/api/placeholder/300/200', 'Rugged mobile computer for field operations', '["Android OS", "Rugged design", "Long battery life"]', TRUE, 4.7, 60),
('Zebra Labels 4x6', 'zebra-labels-4x6', 'labels', '/api/placeholder/300/200', 'High-quality thermal labels for barcode printing', '["Thermal paper", "4x6 inch", "1000 labels per roll"]', TRUE, 4.4, 200),
('Zebra Ribbon 110mm', 'zebra-ribbon-110mm', 'labels', '/api/placeholder/300/200', 'Wax resin ribbon for thermal transfer printing', '["Wax resin", "110mm width", "300m length"]', TRUE, 4.3, 150);

-- Create categories table (optional, for better category management)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories
INSERT INTO categories (name, display_name, description) VALUES
('printers', 'Printers', 'Barcode and label printers'),
('scanners', 'Scanners', 'Barcode and QR code scanners'),
('mobile', 'Mobile Computers', 'Rugged mobile computing devices'),
('labels', 'Labels & Ribbons', 'Thermal labels and printing ribbons');

-- Insert subcategories
INSERT INTO subcategories (name, display_name, category_id, description) VALUES
('desktop-printers', 'Desktop Printers', 1, 'High-performance desktop thermal printers'),
('industrial-printers', 'Industrial Printers', 1, 'Heavy-duty industrial printing solutions'),
('handheld-scanners', 'Handheld Scanners', 2, 'Portable barcode scanning devices'),
('fixed-scanners', 'Fixed Scanners', 2, 'Stationary scanning solutions'),
('rugged-mobile', 'Rugged Mobile', 3, 'Durable mobile computing devices'),
('touch-mobile', 'Touch Mobile', 3, 'Touch-enabled mobile computers'),
('thermal-labels', 'Thermal Labels', 4, 'High-quality thermal printing labels'),
('print-ribbons', 'Print Ribbons', 4, 'Thermal transfer printing ribbons');

-- Insert brands
INSERT INTO brands (name, display_name, description, website) VALUES
('zebra-technologies', 'Zebra Technologies', 'Leading provider of barcode printing and scanning solutions', 'https://www.zebra.com'),
('honeywell', 'Honeywell', 'Industrial automation and scanning solutions', 'https://www.honeywell.com'),
('datalogic', 'Datalogic', 'Automatic data capture and process automation', 'https://www.datalogic.com'),
('toshiba-tec', 'Toshiba TEC', 'Retail and commercial printing solutions', 'https://www.toshibatec.com');

-- Create admin users table (for future admin panel)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'moderator') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, email, password, role) VALUES
('admin', 'admin@zebraprintr.com', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'admin');
