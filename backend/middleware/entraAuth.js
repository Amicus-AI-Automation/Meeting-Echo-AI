/**
 * Entra ID Token Validation Middleware
 * Validates JWT tokens issued by Azure Entra ID
 */

const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const JWKS_URI = `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`;

let cachedKeys = null;
let keyCacheExpiry = null;

/**
 * Fetch JWK keys from Microsoft
 */
const getJWKS = async () => {
  if (cachedKeys && keyCacheExpiry > Date.now()) {
    return cachedKeys;
  }

  try {
    const response = await axios.get(JWKS_URI);
    cachedKeys = response.data.keys;
    keyCacheExpiry = Date.now() + 3600000; // Cache for 1 hour
    console.log("✅ JWKS keys fetched and cached");
    return cachedKeys;
  } catch (err) {
    console.error("❌ Failed to fetch JWKS:", err.message);
    throw err;
  }
};

/**
 * Build public key from JWK using jwk-to-pem
 */
const buildPublicKey = (jwk) => {
  try {
    // Convert JWK to PEM format
    const pem = jwkToPem(jwk);
    console.log("✅ Successfully converted JWK to PEM");
    return pem;
  } catch (err) {
    console.error("❌ Failed to convert JWK to PEM:", err.message);
    throw err;
  }
};

/**
 * Verify Entra ID token
 */
const verifyToken = async (token) => {
  try {
    // Decode header to get key ID
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error("Invalid token format - missing kid");
    }

    const kid = decoded.header.kid;
    console.log(`🔍 Verifying token with key ID: ${kid}`);

    // Fetch keys and find matching key
    const keys = await getJWKS();
    const jwk = keys.find(k => k.kid === kid);
    
    if (!jwk) {
      throw new Error(`Key not found for kid: ${kid}`);
    }

    // Build public key from JWK (returns PEM string)
    const publicKey = buildPublicKey(jwk);

    // Verify token using PEM public key
    const verified = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      audience: CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
    });

    console.log(`✅ Token verified for user: ${verified.preferred_username}`);
    return verified;
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    throw err;
  }
};

/**
 * Middleware to validate Entra ID token
 */
const authenticateEntraId = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authorization header or invalid format",
        error: "Missing Bearer token",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const verified = await verifyToken(token);

    // Get role from frontend header (X-User-Role)
    const frontendRole = req.headers["x-user-role"] || "";

    // Attach user info to request
    req.user = {
      email: verified.preferred_username,
      oid: verified.oid,
      name: verified.name,
      roles: verified.roles || [], // From Entra ID token
      frontendRole: frontendRole, // Role selected by user on frontend
      appId: verified.appid,
    };

    console.log(`👤 User authenticated: ${req.user.email}, Frontend Role: ${frontendRole}, Entra ID Roles: ${req.user.roles.join(", ")}`);
    next();
  } catch (err) {
    console.error("🚫 Authentication error:", err.message);
    res.status(401).json({
      message: "Unauthorized",
      error: err.message,
    });
  }
};

/**
 * Check if user has required role
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check frontend-selected role first (development mode)
    if (req.user.frontendRole) {
      const hasRole = requiredRoles.includes(req.user.frontendRole);
      if (!hasRole) {
        console.warn(
          `🚫 User ${req.user.email} has frontend role: ${req.user.frontendRole}, Needs: [${requiredRoles.join(", ")}]`
        );
        return res.status(403).json({
          message: `Forbidden. Required role: ${requiredRoles.join(" or ")}. You have: ${req.user.frontendRole}`,
        });
      }
      console.log(`✅ User ${req.user.email} authorized with frontend role: ${req.user.frontendRole}`);
      next();
      return;
    }

    // Fallback to Entra ID roles if no frontend role
    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      console.warn(
        `🚫 User ${req.user.email} lacks required role. Has: [${userRoles.join(", ")}], Needs: [${requiredRoles.join(", ")}]`
      );
      return res.status(403).json({
        message: `Forbidden. Required role: ${requiredRoles.join(" or ")}`,
      });
    }

    console.log(`✅ User ${req.user.email} authorized with Entra ID role(s): ${userRoles.join(", ")}`);
    next();
  };
};

module.exports = {
  authenticateEntraId,
  requireRole,
};
