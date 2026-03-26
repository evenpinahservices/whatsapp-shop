import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const products = await kv.get('products') || [];
        
        // Define CSV headers (consistent with FB specs)
        const headers = [
            'id', 'title', 'description', 'availability', 'condition', 
            'price', 'link', 'image_link', 'brand'
        ];

        // Format products to CSV rows
        const rows = products.map(p => {
            return headers.map(header => {
                let val = p[header] || '';
                
                // Special handling for price to ensure ILS suffix
                if (header === 'price' && val && !val.toString().includes('ILS')) {
                    val = `${parseFloat(val).toFixed(2)} ILS`;
                }

                // Escape quotes and wrap in quotes
                val = val.toString().replace(/"/g, '""');
                return `"${val}"`;
            }).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(csvContent);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
}
