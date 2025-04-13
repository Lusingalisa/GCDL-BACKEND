const db = require('../config/db');

const validateProduce = async (req, res, next) => {
    console.log('Validating produce body:', req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const { name, type } = req.body;

    const requiredFields = ['name'];
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (type !== undefined && (typeof type !== 'string' || type.trim() === '')) {
        return res.status(400).json({ error: 'Type must be a non-empty string if provided' });
    }

    // Sanitize inputs
    req.body.name = name.trim();
    req.body.type = type ? type.trim() : null;

    // Check for duplicate name (exclude current produce_id for PUT)
    try {
        const query = 'SELECT produce_id FROM produce WHERE name = ?' + 
                     (req.params.id ? ' AND produce_id != ?' : '');
        const params = [req.body.name];
        if (req.params.id) params.push(req.params.id);

        const [rows] = await db.query(query, params);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Produce name already exists' });
        }
    } catch (error) {
        console.error('Validate produce error:', error);
        return res.status(500).json({ error: 'Failed to validate produce' });
    }

    next();
};

module.exports = { validateProduce };