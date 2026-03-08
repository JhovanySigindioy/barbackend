import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres', // Connect to default postgres DB first to create our app DB
});

export const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const initDatabase = async () => {
  const dbName = process.env.DB_NAME;

  try {
    // 1. Check if database exists
    const checkDb = await pool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

    if (checkDb.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
    }

    // 2. Initialize Tables on the application DB
    console.log(`Initializing tables in ${dbName}...`);

    // Users table (for login and sales tracking)
    await dbPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'waiter',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

    // Tables table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        number VARCHAR(10) UNIQUE NOT NULL,
        capacity INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'available',
        last_order_time VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(50) NOT NULL,
        stock INTEGER DEFAULT 0,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure cost_price exists for existing tables
    try {
      await dbPool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0");
    } catch (e) {
      console.log("cost_price column already exists or error adding it");
    }

    // Expenses table for operational costs
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL, -- Rent, Utilities, Supplies, Maintenance, Other
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        user_id INTEGER REFERENCES users(id),
        total DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        payment_method VARCHAR(20),
        received_amount DECIMAL(10,2),
        change_amount DECIMAL(10,2),
        split_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10,2) NOT NULL,
        cost_at_time DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure cost_at_time exists for existing order_items
    try {
      await dbPool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_at_time DECIMAL(10,2) DEFAULT 0");
    } catch (e) {
      console.log("cost_at_time column already exists or error adding it");
    }

    // Insert default admin if not exists
    const adminCheck = await dbPool.query("SELECT 1 FROM users WHERE username = 'admin'");
    if (adminCheck.rowCount === 0) {
      await dbPool.query(
        "INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)",
        ['Administrador', 'admin', 'admin123', 'admin']
      );
    }

    console.log('Database and tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
};
