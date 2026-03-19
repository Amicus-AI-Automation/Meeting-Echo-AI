import { PublicClientApplication } from "@azure/msal-browser";

const tenantId = process.env.REACT_APP_AZURE_TENANT_ID;
const clientId = process.env.REACT_APP_AZURE_CLIENT_ID;

export const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
