import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Path to the CSV file (relative to root)
        const csvPath = path.join(process.cwd(), 'public', 'facebook_catalog.csv');
        
        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({ error: 'CSV file not found at ' + csvPath });
        }

        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const products = lines.slice(1).filter(line => line.trim() !== '').map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;

            // Simple CSV parser for quoted values
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' && line[i+1] === '"') {
                    current += '"';
                    i++;
                } else if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const product = {};
            headers.forEach((header, index) => {
                product[header.trim()] = values[index] || '';
            });
            return product;
        });

        // Store in KV
        await kv.set('products', products);

        return res.status(200).json({ 
            success: true, 
            message: `Synced ${products.length} products to KV.`,
            sample: products[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Sync failed: ' + err.message });
    }
}
