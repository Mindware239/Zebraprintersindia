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

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sortname VARCHAR(3) NOT NULL,
    name VARCHAR(150) NOT NULL,
    phonecode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create states table
CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    country_id INT NOT NULL,
    country VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    state_id INT NOT NULL,
    state VARCHAR(30) NOT NULL,
    country VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- Insert sample countries data
INSERT INTO countries (sortname, name, phonecode) VALUES
('IN', 'India', '+91'),
('US', 'United States', '+1'),
('GB', 'United Kingdom', '+44'),
('CA', 'Canada', '+1'),
('AU', 'Australia', '+61'),
('DE', 'Germany', '+49'),
('FR', 'France', '+33'),
('JP', 'Japan', '+81'),
('CN', 'China', '+86'),
('BR', 'Brazil', '+55');

-- Insert sample states data for India
INSERT INTO states (name, country_id, country) VALUES
('Delhi', 1, 'India'),
('Maharashtra', 1, 'India'),
('Karnataka', 1, 'India'),
('Tamil Nadu', 1, 'India'),
('Gujarat', 1, 'India'),
('Rajasthan', 1, 'India'),
('Uttar Pradesh', 1, 'India'),
('West Bengal', 1, 'India'),
('Punjab', 1, 'India'),
('Haryana', 1, 'India');

-- Insert sample states data for US
INSERT INTO states (name, country_id, country) VALUES
('California', 2, 'United States'),
('Texas', 2, 'United States'),
('New York', 2, 'United States'),
('Florida', 2, 'United States'),
('Illinois', 2, 'United States'),
('Pennsylvania', 2, 'United States'),
('Ohio', 2, 'United States'),
('Georgia', 2, 'United States'),
('North Carolina', 2, 'United States'),
('Michigan', 2, 'United States');

-- Insert sample cities data for India
INSERT INTO cities (name, state_id, state, country) VALUES
('New Delhi', 1, 'Delhi', 'India'),
('Mumbai', 2, 'Maharashtra', 'India'),
('Pune', 2, 'Maharashtra', 'India'),
('Bangalore', 3, 'Karnataka', 'India'),
('Chennai', 4, 'Tamil Nadu', 'India'),
('Ahmedabad', 5, 'Gujarat', 'India'),
('Jaipur', 6, 'Rajasthan', 'India'),
('Lucknow', 7, 'Uttar Pradesh', 'India'),
('Kolkata', 8, 'West Bengal', 'India'),
('Chandigarh', 9, 'Punjab', 'India');

-- Insert sample cities data for US
INSERT INTO cities (name, state_id, state, country) VALUES
('Los Angeles', 11, 'California', 'United States'),
('San Francisco', 11, 'California', 'United States'),
('Houston', 12, 'Texas', 'United States'),
('Dallas', 12, 'Texas', 'United States'),
('New York City', 13, 'New York', 'United States'),
('Miami', 14, 'Florida', 'United States'),
('Chicago', 15, 'Illinois', 'United States'),
('Philadelphia', 16, 'Pennsylvania', 'United States'),
('Columbus', 17, 'Ohio', 'United States'),
('Atlanta', 18, 'Georgia', 'United States');

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

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    category ENUM('printer', 'scanner', 'mobile', 'utility') NOT NULL,
    operating_system ENUM('windows', 'macos', 'linux', 'android', 'ios') NOT NULL,
    description TEXT,
    compatibility TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    download_url VARCHAR(500),
    release_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample drivers data
INSERT INTO drivers (name, version, category, operating_system, description, compatibility, file_name, file_size, release_date) VALUES
('Zebra ZD420 Driver', '2.0.1', 'printer', 'windows', 'Official driver for Zebra ZD420 desktop printer', 'Windows 10, Windows 11', 'zebra-zd420-driver-v2.0.1.exe', 15925248, '2024-01-15'),
('Zebra ZD620 Driver', '1.8.5', 'printer', 'windows', 'Official driver for Zebra ZD620 industrial printer', 'Windows 10, Windows 11, Windows Server 2019', 'zebra-zd620-driver-v1.8.5.exe', 19608320, '2024-01-10'),
('Zebra DS2208 Scanner Driver', '3.2.1', 'scanner', 'windows', 'Driver for Zebra DS2208 handheld barcode scanner', 'Windows 10, Windows 11', 'zebra-ds2208-driver-v3.2.1.exe', 13002342, '2024-01-08'),
('Zebra MC3300 Mobile Driver', '2.1.3', 'mobile', 'android', 'Driver for Zebra MC3300 mobile computer', 'Android 8.0+', 'zebra-mc3300-android-driver-v2.1.3.apk', 9338880, '2024-01-05'),
('Zebra Setup Utilities', '4.1.2', 'utility', 'windows', 'Complete setup and configuration utilities for Zebra devices', 'Windows 10, Windows 11', 'zebra-setup-utilities-v4.1.2.exe', 26843546, '2024-01-12');

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    author VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags JSON,
    status ENUM('published', 'draft', 'archived') DEFAULT 'published',
    featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'internship') NOT NULL,
    experience_level ENUM('entry', 'mid', 'senior', 'executive') NOT NULL,
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    application_email VARCHAR(100),
    application_url VARCHAR(500),
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample blogs data
INSERT INTO blogs (title, slug, excerpt, content, featured_image, author, category, tags, status, featured) VALUES
('The Future of Barcode Technology in 2024', 'future-barcode-technology-2024', 'Explore the latest trends and innovations in barcode technology that are shaping the industry in 2024.', 'Barcode technology has evolved significantly over the past few decades, and 2024 promises to bring even more exciting developments...', '/api/placeholder/800/400', 'John Smith', 'Technology', '["barcode", "technology", "innovation", "2024"]', 'published', TRUE),
('How to Choose the Right Zebra Printer for Your Business', 'choose-right-zebra-printer', 'A comprehensive guide to selecting the perfect Zebra printer based on your business needs and requirements.', 'Selecting the right printer for your business is crucial for efficiency and productivity. Here are the key factors to consider...', '/api/placeholder/800/400', 'Sarah Johnson', 'Guide', '["zebra", "printer", "business", "guide"]', 'published', TRUE),
('Understanding Barcode Scanner Technologies', 'barcode-scanner-technologies', 'Learn about different barcode scanner technologies and their applications in various industries.', 'Barcode scanners come in various types, each designed for specific applications and environments...', '/api/placeholder/800/400', 'Mike Chen', 'Technology', '["scanner", "barcode", "technology", "applications"]', 'published', FALSE);

-- Insert sample jobs data
INSERT INTO jobs (title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, status, featured) VALUES
('Senior Barcode Solutions Engineer', 'senior-barcode-solutions-engineer', 'Zebra Printers India', 'New Delhi, India', 'full-time', 'senior', '₹8,00,000 - ₹12,00,000', 'We are looking for an experienced Barcode Solutions Engineer to join our team and help design innovative barcode solutions for our clients.', 'Bachelor degree in Engineering, 5+ years experience in barcode technology, Strong problem-solving skills', 'Design and implement barcode solutions, Work with clients to understand requirements, Provide technical support', 'Health insurance, Flexible working hours, Professional development opportunities', 'careers@zebraprintersindia.com', 'active', TRUE),
('Technical Support Specialist', 'technical-support-specialist', 'Zebra Printers India', 'Mumbai, India', 'full-time', 'mid', '₹4,00,000 - ₹6,00,000', 'Join our technical support team to help customers with Zebra printer and scanner issues.', 'Diploma in Electronics, 2+ years experience in technical support, Good communication skills', 'Provide technical support to customers, Troubleshoot printer and scanner issues, Maintain support documentation', 'Competitive salary, Health benefits, Career growth opportunities', 'support@zebraprintersindia.com', 'active', TRUE),
('Sales Executive - Barcode Solutions', 'sales-executive-barcode-solutions', 'Zebra Printers India', 'Bangalore, India', 'full-time', 'entry', '₹3,00,000 - ₹5,00,000', 'We are seeking a motivated Sales Executive to promote our barcode solutions to businesses across India.', 'Bachelor degree in Business, 1+ years sales experience, Excellent communication skills', 'Identify potential clients, Present barcode solutions, Build and maintain client relationships', 'Commission structure, Travel allowances, Sales training programs', 'sales@zebraprintersindia.com', 'active', FALSE);
