import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    try {
        const csvPath = path.join(process.cwd(), 'public', 'facebook_catalog.csv');

        if (!fs.existsSync(csvPath)) {
            return res.status(404).send('Catalog not found');
        }

        const csvContent = fs.readFileSync(csvPath, 'utf8');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(csvContent);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
}
