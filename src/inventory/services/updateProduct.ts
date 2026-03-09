import { dbPool } from '../../config/database.js';

interface UpdateData {
    name: string;
    price: number;
    category: string;
    image?: string;
}

export const updateProduct = async (id: number | string, data: UpdateData) => {
    // We EXCLUDE stock and cost_price from manual editing to maintain financial integrity.
    // Stock and cost changes MUST be recorded through 'inventory/restock' to generate expenses.
    const result = await dbPool.query(
        "UPDATE products SET name = $1, price = $2, category = $3, image = $4 WHERE id = $5 RETURNING *",
        [data.name, data.price, data.category, data.image || '', id]
    );

    if (result.rowCount === 0) throw new Error('Producto no encontrado');
    return result.rows[0];
};
