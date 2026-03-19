/**
 * Authentication Configuration for Azure Entra ID / Microsoft Identity Platform
 * TODO: Replace YOUR_* placeholders with your actual values from Azure portal
 */

// Get from Azure App Registration
const TENANT_ID = process.env.REACT_APP_AZURE_TENANT_ID || "YOUR_TENANT_ID";
const CLIENT_ID = process.env.REACT_APP_AZURE_CLIENT_ID || "YOUR_APP_CLIENT_ID";

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin, // http://localhost:3000
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
  },
};

// Scopes required for login
const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

// Scopes for API access
const apiRequest = {
  scopes: [`api://${CLIENT_ID}/access_as_user`],
};

export { msalConfig, loginRequest, apiRequest };
