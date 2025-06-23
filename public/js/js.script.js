// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const apiButton = document.getElementById('api-btn');
    const apiResponse = document.getElementById('api-response');

    // Add click event listener to API button
    apiButton.addEventListener('click', async function() {
        try {
            // Show loading state
            apiResponse.style.display = 'block';
            apiResponse.innerHTML = 'Loading...';

            // Make API call
            const response = await fetch('/api/hello');
            const data = await response.json();

            // Display response
            apiResponse.innerHTML = `
                <h3>API Response:</h3>
                <p>${data.message}</p>
                <small>Response received at: ${new Date().toLocaleTimeString()}</small>
            `;
        } catch (error) {
            apiResponse.innerHTML = `
                <h3>Error:</h3>
                <p>Failed to fetch data from API</p>
            `;
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});