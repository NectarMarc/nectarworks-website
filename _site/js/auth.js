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
      redirect_uri: 'https://frequencyadvisors.eu/profile/' // Default redirect URI
    });
  };

  console.log('Redirect URI:', window.location.origin + '/profile/');

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
        window.history.replaceState({}, document.title, window.location.pathname);

        if (result.appState?.targetUrl) {
          // Navigate to the originally intended page
          showContentFromUrl(result.appState.targetUrl);
        }
      } catch (err) {
        console.error("Error handling redirect:", err);
      }
    }
  };

  await handleRedirectCallback();

  // Simple router configuration
  const router = {
    "/": () => showContent("home"), // Default home page
    "/profile": () => requireAuth(() => showContent("profile"), "/profile"), // Profile page, requires authentication
    "/login": () => login(), // Login page
  };

  // Check the current path and route to the appropriate handler
  const currentPath = window.location.pathname;
  if (router[currentPath]) {
    router[currentPath](); // Execute the corresponding function
  } else {
    console.log("Route not found:", currentPath);
  }

  // Check if the user is on the protected page
  if (window.location.pathname.startsWith('/profile/')) {
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (!isAuthenticated) {
      // If not authenticated, redirect to the login page
      await auth0Client.loginWithRedirect({
        redirect_uri: 'https://frequencyadvisors.eu/profile/', // Redirect back to /profile/ after login
        appState: { targetUrl: window.location.href } // Save current page
      });
    } else {
      // If authenticated, show protected content
      const user = await auth0Client.getUser();
      document.getElementById('protected-content').innerHTML = `
        <h1>Welcome, ${user.name}</h1>
        <p>You are logged in!</p>
      `;
    }
  }

  // Event listener for login button on the protected page
  if (document.getElementById('login')) {
    document.getElementById('login').addEventListener('click', async () => {
      try {
        const targetUrl = window.location.pathname; // Save the current path as the target
        await auth0Client.loginWithRedirect({
          redirect_uri: window.location.origin, // Keep this general
          appState: { targetUrl } // Dynamically set the intended page
        });
      } catch (err) {
        console.error("Login failed", err);
      }
    });
  }

  // Event listener for logout button
  if (document.getElementById('logout')) {
    document.getElementById('logout').addEventListener('click', async () => {
      try {
        await auth0Client.logout({
          logoutParams: {
            returnTo: window.location.origin // Redirect to the home page after logout
          }
        });
      } catch (err) {
        console.error("Logout failed", err);
      }
    });
  }

  // Call updateUI to adjust the UI based on authentication status
  await updateUI();
});

// Function to update the UI based on authentication status
const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  // Only proceed with updateUI if we are on a /profile/ page
  if (window.location.pathname.startsWith("/profile")) {
    const authVisible = document.querySelector(".auth-visible");
    const authInvisible = document.querySelector(".auth-invisible");
    const userNameElement = document.querySelector(".user-name");

    // Proceed only if the auth elements are present
    if (authVisible && authInvisible) {
      if (isAuthenticated) {
        const user = await auth0Client.getUser();
        if (userNameElement) {
          userNameElement.innerText = user.name; // Display the user's name
        }
        authVisible.classList.remove("hidden"); // Show elements for authenticated users
        authInvisible.classList.add("hidden"); // Hide login-related elements
      } else {
        authInvisible.classList.remove("hidden"); // Show login-related elements
        authVisible.classList.add("hidden"); // Hide elements for authenticated users
      }
    } else {
      console.log("Auth elements not found on this page.");
    }
  }
};

// Simple function to show content based on the page
function showContent(contentId) {
  console.log("Showing content for:", contentId); // Debug log
  const contentElement = document.querySelector(`#${contentId}`); // Look for content by ID, not class

  if (contentElement) {
    contentElement.style.display = 'block'; // Display the content section
  } else {
    console.error(`Content with id ${contentId} not found!`);
  }

  // Hide other sections inside page-content
  const contentSections = document.querySelectorAll('.page-content > div'); // Select direct child divs of .page-content
  contentSections.forEach((section) => {
    if (section !== contentElement) {
      section.style.display = 'none'; // Hide non-matching sections
    }
  });
}

// Simple function to require authentication for certain routes
async function requireAuth(callback, redirectUrl) {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    await auth0Client.loginWithRedirect({
      redirect_uri: 'https://frequencyadvisors.eu/profile/', // Redirect back after login
      appState: { targetUrl: redirectUrl }
    });
  } else {
    // If authenticated, execute the callback (show the content)
    callback();
  }
}

// Simple login function to handle login logic
async function login() {
  try {
    await auth0Client.loginWithRedirect({
      redirect_uri: window.location.origin, // General redirect URI
    });
  } catch (err) {
    console.error("Login failed", err);
  }
}
