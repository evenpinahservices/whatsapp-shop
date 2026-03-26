import { put, list } from '@vercel/blob';

async function getProducts() {
    const { blobs } = await list({ prefix: 'products.json' });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url);
    return res.json();
}

async function saveProducts(products) {
    await put('products.json', JSON.stringify(products), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true
    });
}

export default async function handler(req, res) {
    const { method, query, body } = req;

    try {
        switch (method) {
            case 'GET': {
                const products = await getProducts();
                return res.status(200).json(products);
            }
            case 'POST': {
                const products = await getProducts();
                products.push(body);
                await saveProducts(products);
                return res.status(201).json(body);
            }
            case 'PUT': {
                const products = await getProducts();
                const updated = products.map(p => p.id === body.id ? body : p);
                await saveProducts(updated);
                return res.status(200).json(body);
            }
            case 'DELETE': {
                const { id } = query;
                const products = await getProducts();
                await saveProducts(products.filter(p => p.id !== id));
                return res.status(200).json({ success: true });
            }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
