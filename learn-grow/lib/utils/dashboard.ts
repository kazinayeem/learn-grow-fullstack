/**
 * Get the correct dashboard URL based on user role
 */
export function getDashboardUrl(role?: string): string {
    if (!role) {
        // Try to get from localStorage
        if (typeof window !== 'undefined') {
            role = localStorage.getItem('userRole') || undefined;

            // Fallback to user object if role is still missing
            if (!role) {
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        role = user.role;
                    }
                } catch (e) {
                    console.error("Error parsing user for dashboard url", e);
                }
            }

            role = role || 'student';
        } else {
            return '/student'; // default to student dashboard
        }
    }

    switch (role.toLowerCase()) {
        case 'admin':
            return '/admin';
        case 'manager':
            return '/manager';
        case 'instructor':
        case 'teacher':
            return '/instructor';
        case 'guardian':
        case 'parent':
            return '/guardian';
        case 'student':
        default:
            return '/student'; // Changed from /dashboard to /student
    }
}

/**
 * Redirect to the correct dashboard based on user role
 */
export function redirectToDashboard(role?: string) {
    if (typeof window !== 'undefined') {
        const url = getDashboardUrl(role);
        window.location.href = url;
    }
}
