const db = require('../config/db');

const validateBranch = async (req, res, next) => {
    console.log('Validating branch body:', req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const { branch_name, location } = req.body;

    const requiredFields = ['branch_name'];
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    if (!branch_name || typeof branch_name !== 'string' || branch_name.trim() === '') {
        return res.status(400).json({ error: 'Branch name must be a non-empty string' });
    }

    if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
        return res.status(400).json({ error: 'Location must be a non-empty string if provided' });
    }

    // Sanitize inputs
    req.body.branch_name = branch_name.trim();
    req.body.location = location ? location.trim() : null;

    // Check for duplicate branch_name (exclude current branch_id for PUT)
    try {
        const query = 'SELECT branch_id FROM branches WHERE branch_name = ?' + 
                     (req.params.id ? ' AND branch_id != ?' : '');
        const params = [req.body.branch_name];
        if (req.params.id) params.push(req.params.id);

        const [rows] = await db.query(query, params);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Branch name already exists' });
        }
    } catch (error) {
        console.error('Validate branch error:', error);
        return res.status(500).json({ error: 'Failed to validate branch' });
    }

    next();
};

module.exports = { validateBranch };