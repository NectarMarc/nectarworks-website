// Import the Auth0 SDK (ensure this is loaded before using createAuth0Client)
import { createAuth0Client } from '/js/auth0-spa-js.production.esm.js'; // Adjust the path if necessary

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the Auth0 client
  const auth0 = await createAuth0Client({
    domain: 'dev-rxabnvdhq0d6momh.eu.auth0.com',
    clientId: 'llj5rTVudp6JtSp3UAOx8eJCunpFgCw8',
    redirect_uri: window.location.origin + '/profile/', // Dynamically determine the URL
    cacheLocation: 'localstorage', // Optional: Cache tokens in local storage
    useRefreshTokens: true,       // Optional: Enable refresh tokens
  });
  
  console.log('Redirect URI:', window.location.origin + '/profile/');

  // Check if the user is on the protected page
  if (window.location.pathname.startsWith('/profile/')) {
    const isAuthenticated = await auth0.isAuthenticated();
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to the login page
      await auth0.loginWithRedirect({ redirect_uri: window.location.href });
    } else {
      // If authenticated, show protected content
      const user = await auth0.getUser();
      document.getElementById('protected-content').innerHTML = `
        <h1>Welcome, ${user.name}</h1>
        <p>You are logged in!</p>
      `;
    }
  }

  // Event listener for login button on the protected page
  if (document.getElementById('login')) {
    document.getElementById('login').addEventListener('click', async () => {
      await auth0.loginWithRedirect({ redirect_uri: window.location.origin });
    });
  }

  // Event listener for logout button
  if (document.getElementById('logout')) {
    document.getElementById('logout').addEventListener('click', () => {
      auth0.logout({ returnTo: window.location.origin });
    });
  }
});
