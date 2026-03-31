

const API_URL = `http://${window.location.hostname || 'localhost'}:4000/api`;

/**
 * Generic API fetch wrapper to handle JSON and credentials.
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        credentials: "include"
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("Error Occured");
    }

    if (!response.ok) {
        throw new Error(data.message || "API request failed");
    }

    return data;
}

// -------------------------
// User API Services
// -------------------------

const UserService = {
    register: async (userData) => {
        return await apiFetch("/users/register", {
            method: "POST",
            body: userData
        });
    },

    login: async (credentials) => {
        return await apiFetch("/users/login", {
            method: "POST",
            body: credentials
        });
    },

    logout: async () => {
        return await apiFetch("/users/logout", {
            method: "POST"
        });
    },

    changePassword: async (passwords) => {
        return await apiFetch("/users/change-password", {
            method: "PATCH",
            body: passwords
        });
    },

    loadAllUsers : async() => {
        return await apiFetch("/users/all-users")
    }
};

// -------------------------
// Book API Services
// -------------------------

const BookService = {
    getAllBooks: async () => {
        return await apiFetch("/books/get-all-books");
    },
    
    addBook: async (bookData) => {
        return await apiFetch("/books/add-book", {
            method: "POST",
            body: bookData
        });
    },

    updateBook: async (bookId, updates) => {
        return await apiFetch(`/books/update-book/${bookId}`, {
            method: "PATCH",
            body: updates
        });
    },

    removeBook: async (isbn) => {
        return await apiFetch(`/books/remove-book/${isbn}`, {
            method: "DELETE"
        });
    },

    getUserBooks: async () => {
        return await apiFetch("/books/user-books");
    },

    getOverdueBooks: async () => {
        return await apiFetch("/books/overdue-books");
    },

    getDueSoonBooks: async () => {
        return await apiFetch("/books/due-soon-books");
    }
};

// -------------------------
// Borrow Record API Services
// -------------------------

const BorrowService = {
    getMyRecords: async () => {
        return await apiFetch("/borrow/my-records");
    },

    getMyIssued: async () => {
        return await apiFetch("/borrow/my-issued");
    },

    getAllBorrowRecords: async() =>{
        return await apiFetch("/borrow/all-records");
    },

    getMyOverdue: async () => {
        return await apiFetch("/borrow/my-overdue");
    },

    getMyDueSoon: async () => {
        return await apiFetch("/borrow/my-due-soon");
    },

    // LIBRARIAN / ADMIN ROUTES
    getAllIssuedRecords: async () => {
        return await apiFetch("/borrow/issued-records");
    },

    getAllOverdue: async () => {
        return await apiFetch("/borrow/overdue");
    },

    getAllDueSoon: async () => {
        return await apiFetch("/borrow/due-soon");
    }
};

// -------------------------
// Request API Services
// -------------------------

const RequestService = {
    createRequest: async (requestData) => {
        return await apiFetch("/request/create", {
            method: "POST",
            body: requestData
        });
    },

    getMyRequests: async () => {
        return await apiFetch("/request/my");
    },

    cancelRequest: async (reqId) => {
        return await apiFetch(`/request/cancel/${reqId}`, {
            method: "DELETE"
        });
    },

    getAllRequests: async () => {
        return await apiFetch("/request/all");
    },

    handleRequest: async (handleData) => {
        // handleData should likely contain reqId, status (approved/rejected)
        return await apiFetch("/request/handle", {
            method: "PATCH",
            body: handleData
        });
    }
};

const NotificationService = {
    loadNotifications: async() =>{
        return await apiFetch("/notification/loadNotifications")
    }
}

// Basic Auth State Management Helpers
function getRoleFromPath() {
    const path = window.location.pathname;
    if (path.includes("admin")) return "admin";
    if (path.includes("librarian")) return "librarian";
    if (path.includes("student") || path.includes("faculty")) return "student"; // simplified
    return null;
}

// Redirect if unauthenticated (assuming role check)
async function handleLogout(e) {
    if(e) e.preventDefault();
    try {
        await UserService.logout();
    } catch(err) {
        console.error("Logout failed", err);
    } finally {
        window.location.href = "login.html";
    }
}

// Attach event listeners for logout buttons if they exist
document.addEventListener('DOMContentLoaded', () => {
    // Also include '.logout a' handles logout from navbars
    const logoutBtns = document.querySelectorAll('.logout a, #logout-btn');
    logoutBtns.forEach(btn => {
        if(btn.textContent.toLowerCase().includes('logout')) {
            btn.addEventListener('click', handleLogout);
        }
    });
});
