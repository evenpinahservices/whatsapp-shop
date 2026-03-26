import { list } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        const { blobs } = await list({ prefix: 'products.json' });
        const products = blobs.length > 0
            ? await fetch(blobs[0].url).then(r => r.json())
            : [];

        const headers = [
            'id', 'title', 'description', 'availability', 'condition',
            'price', 'link', 'image_link', 'brand'
        ];

        const rows = products.map(p =>
            headers.map(header => {
                let val = p[header] || '';
                if (header === 'price' && val && !val.toString().includes('ILS')) {
                    val = `${parseFloat(val).toFixed(2)} ILS`;
                }
                val = val.toString().replace(/"/g, '""');
                return `"${val}"`;
            }).join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(csvContent);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
}
