// Allowed produce types based on GCDL requirements
const VALID_PRODUCE_TYPES = ['beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'];
const VALID_BRANCHES = ['Maganjo', 'Matugga'];

const validateProcurementData = (req, res, next) => {
    // Check if body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is missing or invalid' });
    }

    const {
        name,
        type,
        date,
        time,
        tonnage,
        cost,
        dealerName,
        branch,
        contact,
        sellingPrice
    } = req.body;

    // Check for required fields
    const requiredFields = [
        'name', 'type', 'date', 'time', 'tonnage',
        'cost', 'dealerName', 'branch', 'contact', 'sellingPrice'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    // Validate produce type
    const normalizedType = type.toLowerCase();
    if (!VALID_PRODUCE_TYPES.includes(normalizedType)) {
        return res.status(400).json({
            error: 'Invalid produce type',
            validTypes: VALID_PRODUCE_TYPES
        });
    }

    // Validate numeric fields
    const numericFields = { tonnage, cost, sellingPrice };
    for (const [field, value] of Object.entries(numericFields)) {
        if (!isNumeric(value)) {
            return res.status(400).json({ error: `${field} must be a number` });
        }
    }

    if (tonnage < 1) {
        return res.status(400).json({ error: 'Tonnage must be greater than or equal to 1' });
    }
    if (cost < 0 || sellingPrice < 0) {
        return res.status(400).json({
            error: `${cost < 0 ? 'Cost' : 'Selling price'} must be a non-negative number`
        });
    }

    // Validate phone number
    if (!isValidPhoneNumber(contact)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate branch
    if (!VALID_BRANCHES.includes(branch)) {
        return res.status(400).json({
            error: 'Invalid branch name',
            validBranches: VALID_BRANCHES
        });
    }

    // Attach normalized data to req.body for consistency
    req.body.type = normalizedType;
    req.body.tonnage = parseFloat(tonnage);
    req.body.cost = parseFloat(cost);
    req.body.sellingPrice = parseFloat(sellingPrice);

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

module.exports = { validateProcurementData };