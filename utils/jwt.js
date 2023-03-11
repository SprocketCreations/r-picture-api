const jwt = require("jsonwebtoken");

/**
 * Helper for creating a jwt.
 * @param {number} userId 
 * @returns {string} The signed jwt.
 */
function signUser(userId) {
	return jwt.sign({
		userId: userId
	}, process.env.JWT_SECRET, {
		expiresIn: "6h"
	});
}

/**
 * Middleware for the json web token.
 */
function extractTokenMiddleware(req, res, next) {
	req.jwt = {
		token: req.headers?.authorization?.split(" ")[1]
	};

	if (req.jwt.token) {
		req.jwt.data = verifyToken(req.jwt.token);

		if (req.jwt.data) {
			req.jwt.userId = req.jwt.data.userId;
		}
	}

	next();
}

/**
 * Verifies a json webtoken and returns its data or null if it was not valid. 
 * @param {string} token The JSON web token
 * @returns {jwt.Jwt | null}
 */
function verifyToken(token) {
	if(!token) throw new Error("Token must not be null.");
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		if (error.name === "TokenExpiredError" ||
			error.name === "JsonWebTokenError" ||
			error.name === "NotBeforeError") {
			console.log(error);
			return null;
		}
		throw error;
	}
}

module.exports = {
	extractTokenMiddleware,
	verifyToken,
	signUser
};