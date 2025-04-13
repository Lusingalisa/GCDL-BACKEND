CREATE DATABASE gcdl;
USE gcdl;
CREATE TABLE branches(
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(50) NOT NULL
);
CREATE TABLE users(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('manager','sales_agent','ceo') NOT NULL,
    branch_id INT,
    FOREIGN KEY(branch_id) REFERENCES branches(branch_id)
);
DESC users;
CREATE TABLE produce (
  produce_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- e.g., 'beans', 'maize'
  type VARCHAR(50)
);
CREATE TABLE procurement (
  procurement_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  type VARCHAR(50),
  date DATE NOT NULL,
  time TIME NOT NULL,
  tonnage DECIMAL(10, 2) NOT NULL,
  cost INT NOT NULL,
  dealer_name VARCHAR(100) NOT NULL,
  branch_id INT,
  contact INT(10) NOT NULL,
  selling_price INT NOT NULL,
  FOREIGN KEY (produce_id) REFERENCES produce(produce_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
ALTER TABLE sales ADD COLUMN receipt_url VARCHAR(255);
CREATE TABLE sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  tonnage DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(15, 2) NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  sales_agent_id INT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  buyer_contact VARCHAR(20) NOT NULL,
  receipt_url VARCHAR(255),
  FOREIGN KEY (produce_id) REFERENCES produce(produce_id),
  FOREIGN KEY (sales_agent_id) REFERENCES users(user_id)
);
CREATE TABLE credit_sales (
  credit_sale_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_name VARCHAR(100) NOT NULL,
  national_id VARCHAR(50) NOT NULL, -- Assuming a reasonable length for national ID
  location VARCHAR(100) NOT NULL,
  amount_due INT NOT NULL,
  due_date DATE NOT NULL,
  produce_id INT,
  tonnage DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (produce_id) REFERENCES produce(produce_id)
);
CREATE TABLE stock (
  stock_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  branch_id INT,
  quantity DECIMAL(10, 2) NOT NULL, -- Represents tonnage
  FOREIGN KEY (produce_id) REFERENCES produce(produce_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

INSERT INTO branches (branch_name) VALUES ('Maganjo'), ('Matugga');
INSERT INTO produce (name, type) VALUES ('Beans', 'Red'), ('Maize', 'Yellow');
INSERT INTO users (username, email, password, role, branch_id) 
VALUES ('Charlie', 'charlie7@gmail.com.com', 'Charlie7@2003', 'ceo', NULL); -- CEO has no branch restriction

SHOW DATABASES;
USE gcdl;
SHOW TABLES;

ALTER TABLE credit_sales ADD COLUMN sales_agent_id INT,
ADD FOREIGN KEY (sales_agent_id) REFERENCES users(user_id);

ALTER TABLE branches ADD COLUMN location VARCHAR(50) NOT NULL;ALTER TABLE branches ADD COLUMN branch_name VARCHAR(50) NOT NULL;