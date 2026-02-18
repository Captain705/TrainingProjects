// ============================================
// Admin Dashboard JavaScript
// ============================================

// Mock Data
const usersData = [
    { id: 1, name: "Emma Wilson", email: "emma.wilson@example.com", role: "Admin", status: "Active", dateJoined: "2024-01-15", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { id: 2, name: "James Brown", email: "james.brown@example.com", role: "User", status: "Active", dateJoined: "2024-02-20", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
    { id: 3, name: "Sarah Davis", email: "sarah.davis@example.com", role: "Editor", status: "Pending", dateJoined: "2024-03-10", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 4, name: "Michael Miller", email: "michael.miller@example.com", role: "User", status: "Inactive", dateJoined: "2024-01-28", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
    { id: 5, name: "Lisa Anderson", email: "lisa.anderson@example.com", role: "User", status: "Active", dateJoined: "2024-04-05", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
    { id: 6, name: "David Taylor", email: "david.taylor@example.com", role: "Editor", status: "Active", dateJoined: "2024-02-14", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { id: 7, name: "Jennifer Martinez", email: "jennifer.martinez@example.com", role: "User", status: "Active", dateJoined: "2024-03-22", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer" },
    { id: 8, name: "Robert Johnson", email: "robert.johnson@example.com", role: "Admin", status: "Active", dateJoined: "2024-01-08", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" },
    { id: 9, name: "Maria Garcia", email: "maria.garcia@example.com", role: "User", status: "Pending", dateJoined: "2024-04-12", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
    { id: 10, name: "William Lee", email: "william.lee@example.com", role: "Editor", status: "Active", dateJoined: "2024-03-30", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=William" },
    { id: 11, name: "Patricia White", email: "patricia.white@example.com", role: "User", status: "Inactive", dateJoined: "2024-02-28", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia" },
    { id: 12, name: "Richard Harris", email: "richard.harris@example.com", role: "User", status: "Active", dateJoined: "2024-04-18", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Richard" },
    { id: 13, name: "Linda Clark", email: "linda.clark@example.com", role: "Editor", status: "Active", dateJoined: "2024-01-22", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda" },
    { id: 14, name: "Thomas Lewis", email: "thomas.lewis@example.com", role: "User", status: "Pending", dateJoined: "2024-03-15", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas" },
    { id: 15, name: "Barbara Walker", email: "barbara.walker@example.com", role: "User", status: "Active", dateJoined: "2024-02-08", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Barbara" }
];

// Sales data for line chart
const salesData = {
    week: [120, 150, 180, 140, 200, 250, 220],
    month: [1200, 1500, 1800, 1400, 2000, 2500, 2200, 2800, 3200, 2900, 3500, 4000],
    year: [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000]
};

const salesLabels = {
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    year: ['2020', '2021', '2022', '2023', '2024']
};

// Revenue data for bar chart
const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 69000, 81000, 78000, 92000, 89000]
};

// User distribution data for pie chart
const userDistributionData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    values: [55, 35, 10]
};

// ============================================
// DOM Elements
// ============================================
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const tableBody = document.getElementById('tableBody');
const tableSearch = document.getElementById('tableSearch');
const exportBtn = document.getElementById('exportBtn');
const pagination = document.getElementById('pagination');
const navItems = document.querySelectorAll('.nav-item');

// ============================================
// State
// ============================================
let currentPage = 1;
const itemsPerPage = 10;
let filteredUsers = [...usersData];
let charts = {};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initCharts();
    initTable();
    initEventListeners();
});

// ============================================
// Theme Toggle
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateChartThemes(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'ph-bold ph-sun' : 'ph-bold ph-moon';
}

// ============================================
// Sidebar
// ============================================
function initSidebar() {
    // Check if we're on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

function toggleMobileMenu() {
    sidebar.classList.toggle('mobile-open');
}

// ============================================
// Charts
// ============================================
function initCharts() {
    const theme = document.documentElement.getAttribute('data-theme');
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    // Sales Line Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    charts.sales = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: salesLabels.month,
            datasets: [{
                label: 'Sales',
                data: salesData.month,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        }
    });

    // Revenue Bar Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    charts.revenue = new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: revenueData.labels,
            datasets: [{
                label: 'Revenue',
                data: revenueData.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(20, 184, 166, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return '$' + value / 1000 + 'k';
                        }
                    }
                }
            }
        }
    });

    // User Distribution Pie Chart
    const userDistCtx = document.getElementById('userDistributionChart').getContext('2d');
    charts.userDistribution = new Chart(userDistCtx, {
        type: 'doughnut',
        data: {
            labels: userDistributionData.labels,
            datasets: [{
                data: userDistributionData.values,
                backgroundColor: [
                    '#6366f1',
                    '#22c55e',
                    '#f59e0b'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

function updateChartThemes(theme) {
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    // Update sales chart
    charts.sales.options.scales.x.ticks.color = textColor;
    charts.sales.options.scales.y.ticks.color = textColor;
    charts.sales.options.scales.y.grid.color = gridColor;
    charts.sales.update();

    // Update revenue chart
    charts.revenue.options.scales.x.ticks.color = textColor;
    charts.revenue.options.scales.y.ticks.color = textColor;
    charts.revenue.options.scales.y.grid.color = gridColor;
    charts.revenue.update();

    // Update user distribution chart
    charts.userDistribution.options.plugins.legend.labels.color = textColor;
    charts.userDistribution.update();
}

// ============================================
// Sales Time Range
// ============================================
function updateSalesChart(range) {
    const labels = salesLabels[range];
    const data = salesData[range];
    
    charts.sales.data.labels = labels;
    charts.sales.data.datasets[0].data = data;
    charts.sales.update();
}

// ============================================
// Table
// ============================================
function initTable() {
    renderTable();
    renderPagination();
}

function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredUsers.slice(start, end);

    tableBody.innerHTML = pageData.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="${user.avatar}" alt="${user.name}">
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <span class="status-badge ${user.status.toLowerCase()}">${user.status}</span>
            </td>
            <td>${formatDate(user.dateJoined)}</td>
        </tr>
    `).join('');

    updatePaginationInfo(start, end);
}

function renderPagination() {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    let paginationHTML = '';

    paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <i class="ph-bold ph-caret-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<button disabled>...</button>`;
        }
    }

    paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <i class="ph-bold ph-caret-right"></i>
    </button>`;

    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    renderPagination();
}

function updatePaginationInfo(start, end) {
    const total = filteredUsers.length;
    document.getElementById('showingStart').textContent = total > 0 ? start + 1 : 0;
    document.getElementById('showingEnd').textContent = Math.min(end, total);
    document.getElementById('totalEntries').textContent = total;
}

function filterTable(searchTerm) {
    filteredUsers = usersData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    currentPage = 1;
    renderTable();
    renderPagination();
}

function exportToCSV() {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Date Joined'];
    const rows = filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.dateJoined
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users_export.csv';
    link.click();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Notification dropdown
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        notificationDropdown.classList.remove('show');
    });

    notificationDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Table search
    tableSearch.addEventListener('input', (e) => {
        filterTable(e.target.value);
    });

    // Export button
    exportBtn.addEventListener('click', exportToCSV);

    // Sales time range
    document.getElementById('salesTimeRange').addEventListener('change', (e) => {
        updateSalesChart(e.target.value);
    });

    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Close mobile menu on click
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });

    // Window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

// Make functions globally available
window.changePage = changePage;
