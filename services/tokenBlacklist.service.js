// In-memory token blacklist service to replace Redis
class TokenBlacklistService {
    constructor() {
        this.blacklistedTokens = new Set();
        console.log('Token blacklist service initialized (in-memory)');
    }

    // Add token to blacklist
    async set(token) {
        this.blacklistedTokens.add(token);
        return 'OK';
    }

    // Check if token is blacklisted
    async get(token) {
        return this.blacklistedTokens.has(token) ? token : null;
    }

    // Remove token from blacklist
    async del(token) {
        this.blacklistedTokens.delete(token);
        return 1;
    }

    // Clear all blacklisted tokens (useful for testing)
    clear() {
        this.blacklistedTokens.clear();
    }

    // Get count of blacklisted tokens
    size() {
        return this.blacklistedTokens.size;
    }
}

// Create a singleton instance
const tokenBlacklistService = new TokenBlacklistService();

export default tokenBlacklistService;
