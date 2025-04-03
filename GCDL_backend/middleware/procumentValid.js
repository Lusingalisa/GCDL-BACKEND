// middleware/procurementValidation.js

// Allowed produce types based on GCDL requirements
const VALID_PRODUCE_TYPES = ['beans', 'grain maize', 'cowpeas', 'groundnuts', 'rice', 'soybeans'];

const validateProcurementData = (req, res, next) => {
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
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            error: 'Missing required fields', 
            missing: missingFields 
        });
    }

    // Validate produce type
    if (!VALID_PRODUCE_TYPES.includes(type.toLowerCase())) {
        return res.status(400).json({ 
            error: 'Invalid produce type', 
            validTypes: VALID_PRODUCE_TYPES 
        });
    }

    // Validate tonnage
    if (!isNumeric(tonnage) || tonnage < 1) {
        return res.status(400).json({ 
            error: 'Tonnage must be a number greater than or equal to 1' 
        });
    }

    // Validate cost
    if (!isNumeric(cost) || cost < 0) {
        return res.status(400).json({ 
            error: 'Cost must be a non-negative number' 
        });
    }

    // Validate selling price
    if (!isNumeric(sellingPrice) || sellingPrice < 0) {
        return res.status(400).json({ 
            error: 'Selling price must be a non-negative number' 
        });
    }

    // Validate phone number
    if (!isValidPhoneNumber(contact)) {
        return res.status(400).json({ 
            error: 'Invalid phone number format' 
        });
    }

    // Validate branch
    if (!['Maganjo', 'Matugga'].includes(branch)) {
        return res.status(400).json({ 
            error: 'Invalid branch name', 
            validBranches: ['Maganjo', 'Matugga'] 
        });
    }

    // If all validations pass, proceed to the next middleware/route handler
    next();
};

// Helper functions
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function isValidPhoneNumber(phoneNumber) {
    // Uganda phone number validation (e.g., +256 followed by 9 digits)
    const phoneRegex = /^\+256\d{9}$/;
    return phoneRegex.test(phoneNumber);
}

module.exports = {
    validateProcurementData
};