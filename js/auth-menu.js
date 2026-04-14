// js/auth-menu.js
// Toggle auth dropdown links based on current session.

document.addEventListener('DOMContentLoaded', function () {
    const dashboardLinks = document.querySelectorAll('.logged-in-only-link');
    const adminLinks = document.querySelectorAll('.admin-only-link');
    if (!adminLinks.length && !dashboardLinks.length) return;

    try {
        const currentUserJSON = localStorage.getItem('inheriti_current_user');
        if (!currentUserJSON) return;

        const currentUser = JSON.parse(currentUserJSON);
        dashboardLinks.forEach((link) => {
            link.hidden = false;
        });

        const email = (currentUser.email || '').toLowerCase();
        const isAdminByRole = currentUser.role === 'admin';
        const isAdminByEmail = email === 'admin@inheriti.com';

        if (!isAdminByRole && !isAdminByEmail) return;

        adminLinks.forEach((link) => {
            link.hidden = false;
        });
    } catch (error) {
        console.error('Failed to initialize auth menu:', error);
    }
});
