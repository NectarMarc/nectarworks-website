// Import the Auth0 SDK (ensure this is loaded before using createAuth0Client)
import { createAuth0Client } from '/js/auth0-spa-js.production.esm.js'; // Adjust the path if necessary

// Define auth0Client globally
let auth0Client;

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch Auth0 configuration from the external JSON file
  const fetchAuthConfig = async () => {
    const response = await fetch("/auth_config.json");
    return await response.json();
  };

  // Initialize the Auth0 client
  const configureClient = async () => {
    const config = await fetchAuthConfig();
    auth0Client = await createAuth0Client({
      domain: config.domain,
      clientId: config.clientId,
      redirect_uri: 'https://frequencyadvisors.eu/profile/my-profile' // Redirect to the profile page after login
    });
  };

  // Ensure the Auth0 client is initialized before proceeding
  await configureClient();

  // Handle post-login redirection
  const handleRedirectCallback = async () => {
    const query = window.location.search;

    if (query.includes("code=") && query.includes("state=")) {
      console.log("Handling redirect callback");
      try {
        const result = await auth0Client.handleRedirectCallback();

        // Clean up the URL by removing query parameters
        window.history.replaceState({}, document.title, "/profile/my-profile");

        if (result.appState?.targetUrl) {
          // Navigate to the originally intended page
          window.location.href = result.appState.targetUrl;
        }
      } catch (err) {
        console.error("Error handling redirect:", err);
      }
    }
  };

  await handleRedirectCallback();

  // Ensure the user is authenticated when visiting protected routes
  const enforceAuthentication = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const currentPath = window.location.pathname;

    if (currentPath === '/profile/my-profile' && !isAuthenticated) {
      // Redirect unauthenticated users to the login page
      await auth0Client.loginWithRedirect({
        redirect_uri: 'https://frequencyadvisors.eu/profile/my-profile',
        appState: { targetUrl: '/profile/my-profile' }
      });
    }
  };

  await enforceAuthentication();

  // Function to attach login and logout events to all buttons
  const attachAuthEventListeners = () => {
    const loginButtons = document.querySelectorAll('#login');
    const logoutButtons = document.querySelectorAll('#logout');

    loginButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await auth0Client.loginWithRedirect({
            redirect_uri: 'https://frequencyadvisors.eu/profile/my-profile'
          });
        } catch (err) {
          console.error("Login failed", err);
        }
      });
    });

    logoutButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await auth0Client.logout({
            logoutParams: {
              returnTo: 'https://frequencyadvisors.eu/profile/login.html' // Redirect to login page after logout
            }
          });
        } catch (err) {
          console.error("Logout failed", err);
        }
      });
    });
  };

  attachAuthEventListeners();

  // Update the UI based on authentication status
  await updateUI();
});

// Function to update the UI based on authentication status
const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  const user = isAuthenticated ? await auth0Client.getUser() : null;

  // Show or hide elements based on the user's authentication state
  document.querySelectorAll('.auth-visible').forEach((el) => {
    el.classList.toggle('hidden', !isAuthenticated);
  });

  document.querySelectorAll('.auth-invisible').forEach((el) => {
    el.classList.toggle('hidden', isAuthenticated);
  });

  // Update the user's name in all places
  document.querySelectorAll('.user-name').forEach((el) => {
    el.textContent = isAuthenticated && user ? user.name : '';
  });
};
