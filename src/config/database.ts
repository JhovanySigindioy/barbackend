import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// En Supabase/Cloud, usualmente NODE_ENV debe ser 'production' para activar SSL
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase.com');

const dbConfig = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: isProduction ? { rejectUnauthorized: false } : false 
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'postgres',
      ssl: isProduction ? { rejectUnauthorized: false } : false
    };

// Usamos un solo pool para todo el ciclo de vida, optimizando recursos
export const dbPool = new Pool(dbConfig);

export const initDatabase = async () => {
  const dbName = process.env.DB_NAME || 'postgres';

  try {
    console.log(`Iniciando conexión con la base de datos: ${dbName}...`);

    // 1. Verificación de Tablas (Users)
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

    // 2. Tablas de infraestructura (Tables y Products)
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

    // 3. Gastos y Finanzas
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Gestión de Pedidos
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

    // 5. Inventario y Movimientos
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        type VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        reason VARCHAR(255),
        unit_cost DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        expense_id INTEGER REFERENCES expenses(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Migraciones rápidas (Columnas faltantes por evolución del esquema)
    const migrations = [
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_at_time DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS expense_id INTEGER REFERENCES expenses(id) ON DELETE SET NULL",
      "ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2)",
      "ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2)"
    ];

    for (const sql of migrations) {
      try { await dbPool.query(sql); } catch (e) { /* Columna ya existe */ }
    }

    // 7. Usuario Administrador Inicial
    const adminCheck = await dbPool.query("SELECT 1 FROM users WHERE username = 'admin'");
    if (adminCheck.rowCount === 0) {
      console.log('Creando usuario administrador por defecto...');
      await dbPool.query(
        "INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)",
        ['Administrador', 'admin', 'admin123', 'admin']
      );
    }

    console.log('✅ Base de datos y tablas inicializadas correctamente');
  } catch (err) {
    console.error('❌ Error inicializando la base de datos:', err);
  }
};