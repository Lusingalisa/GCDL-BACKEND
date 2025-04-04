// Allowed produce types based on GCDL requirements
const VALID_PRODUCE_TYPES = ['beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'];

const validateSalesData = (req, res, next) => {
    // Check if body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const {
        produceName,
        tonnage,
        amountPaid,
        buyerName,
        salesAgentName,
        date,
        time,
        buyerContact
    } = req.body;

    // Check for required fields
    const requiredFields = [
        'produceName', 'tonnage', 'amountPaid', 'buyerName',
        'salesAgentName', 'date', 'time', 'buyerContact'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    // Validate produce name
    const normalizedProduceName = produceName.toLowerCase();
    if (!VALID_PRODUCE_TYPES.includes(normalizedProduceName)) {
        return res.status(400).json({
            error: 'Invalid produce type',
            validTypes: VALID_PRODUCE_TYPES
        });
    }

    // Validate numeric fields
    const numericFields = { tonnage, amountPaid };
    for (const [field, value] of Object.entries(numericFields)) {
        if (!isNumeric(value)) {
            return res.status(400).json({ error: `${field} must be a number` });
        }
    }

    if (tonnage < 0.1) { // Minimum tonnage for a sale (adjust as needed)
        return res.status(400).json({ error: 'Tonnage must be at least 0.1 tons' });
    }
    if (amountPaid < 0) {
        return res.status(400).json({ error: 'Amount paid must be a non-negative number' });
    }

    // Validate phone number (Uganda format: +256 followed by 9 digits)
    if (!isValidPhoneNumber(buyerContact)) {
        return res.status(400).json({ error: 'Invalid buyer contact format' });
    }

    // Validate date format (simple check for YYYY-MM-DD)
    if (!isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }

    // Normalize data
    req.body.produceName = normalizedProduceName;
    req.body.tonnage = parseFloat(tonnage);
    req.body.amountPaid = parseFloat(amountPaid);

    next();
};

// Helper functions
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+256\d{9}$/;
    return phoneRegex.test(phoneNumber);
}

function isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

module.exports = { validateSalesData };