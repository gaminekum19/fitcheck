// Header that proves a request to the AI service comes from this backend.
exports.aiHeaders = () => (process.env.AI_SERVICE_KEY ? { 'X-Service-Key': process.env.AI_SERVICE_KEY } : {});
