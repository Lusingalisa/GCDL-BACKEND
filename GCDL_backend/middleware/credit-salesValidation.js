const validateCreditSale = (req, res, next) => {
    console.log('Validating credit sale body:', req.body);
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const {
        produceName,
        tonnage,
        amountDue,
        buyerName,
        nationalId,
        location,
        dueDate
    } = req.body;

    const requiredFields = [
        'produceName', 'tonnage', 'amountDue', 'buyerName',
        'nationalId', 'location', 'dueDate'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    if (!produceName || typeof produceName !== 'string' || produceName.trim() === '') {
        return res.status(400).json({ error: 'Produce name must be a non-empty string' });
    }

    if (!isNumeric(tonnage) || parseFloat(tonnage) < 0.1) {
        return res.status(400).json({ error: 'Tonnage must be a number and at least 0.1 tons' });
    }

    if (!isNumeric(amountDue) || parseFloat(amountDue) <= 0) {
        return res.status(400).json({ error: 'Amount due must be a positive number' });
    }

    if (!buyerName || typeof buyerName !== 'string' || buyerName.trim() === '') {
        return res.status(400).json({ error: 'Buyer name must be a non-empty string' });
    }

    if (!nationalId || typeof nationalId !== 'string' || nationalId.trim() === '') {
        return res.status(400).json({ error: 'National ID must be a non-empty string' });
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
        return res.status(400).json({ error: 'Location must be a non-empty string' });
    }

    if (!isValidDate(dueDate)) {
        return res.status(400).json({ error: 'Invalid due date format (use YYYY-MM-DD)' });
    }

    // Ensure dueDate is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    if (due < today) {
        return res.status(400).json({ error: 'Due date must be today or in the future' });
    }

    // Sanitize inputs
    req.body.produceName = produceName.trim();
    req.body.tonnage = parseFloat(tonnage);
    req.body.amountDue = parseFloat(amountDue);
    req.body.buyerName = buyerName.trim();
    req.body.nationalId = nationalId.trim();
    req.body.location = location.trim();
    req.body.dueDate = dueDate;

    next();
};

// Helper functions
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

module.exports = { validateCreditSale };