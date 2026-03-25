import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { method, query, body } = req;

    try {
        switch (method) {
            case 'GET':
                const products = await kv.get('products') || [];
                return res.status(200).json(products);

            case 'POST':
                const newProduct = body;
                const existingProducts = await kv.get('products') || [];
                const updatedProducts = [...existingProducts, newProduct];
                await kv.set('products', updatedProducts);
                return res.status(201).json(newProduct);

            case 'PUT':
                const updatedProduct = body;
                const currentProducts = await kv.get('products') || [];
                const modifiedProducts = currentProducts.map(p => 
                    p.id === updatedProduct.id ? updatedProduct : p
                );
                await kv.set('products', modifiedProducts);
                return res.status(200).json(updatedProduct);

            case 'DELETE':
                const { id } = query;
                const allProducts = await kv.get('products') || [];
                const filteredProducts = allProducts.filter(p => p.id !== id);
                await kv.set('products', filteredProducts);
                return res.status(200).json({ success: true });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
