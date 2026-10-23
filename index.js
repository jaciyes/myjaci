class NexusApp {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('nexus_users')) || [
            { id: 1, name: 'Alex Mercer', email: 'alex@example.com', created_at: new Date().toISOString() },
            { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', created_at: new Date().toISOString() }
        ];

        this.logs = JSON.parse(localStorage.getItem('nexus_logs')) || [
            { id: 1, action: 'SYSTEM', details: 'Initialized Application Data', created_at: new Date().toLocaleString() }
        ];

        this.settings = JSON.parse(localStorage.getItem('nexus_settings')) || {
            theme: 'dark',
            page_size: 8
        };

        this.currentPage = 1;
        this.filterQuery = '';
        this.sortBy = 'created_at';
        this.sortDirection = 'desc';

        this.init();
    }

    init() {
        this.saveData();
        this.showPage('dashboard');
        this.addLog('VIEW', 'Opened Dashboard');
    }

    saveData() {
        localStorage.setItem('nexus_users', JSON.stringify(this.users));
        localStorage.setItem('nexus_logs', JSON.stringify(this.logs));
        localStorage.setItem('nexus_settings', JSON.stringify(this.settings));
    }

    addLog(action, details) {
        const newLog = {
            id: this.logs.length + 1,
            action: action,
            details: details,
            created_at: new Date().toLocaleString()
        };
        this.logs.unshift(newLog);
        this.saveData();
    }

    showNotice(msg) {
        const noticeBox = document.getElementById('notice-box');
        noticeBox.innerText = `✓ ${msg}`;
        noticeBox.style.display = 'block';
        setTimeout(() => { noticeBox.style.display = 'none'; }, 4000);
    }

    showPage(pageId, extraParam = null) {
        document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

        const targetNav = document.getElementById(`nav-${pageId}`);
        if (targetNav) targetNav.classList.add('active');

        switch(pageId) {
            case 'dashboard':
                document.getElementById('page-dashboard').style.display = 'block';
                this.renderDashboard();
                break;
            case 'add-user':
                this.setupUserForm(extraParam);
                document.getElementById('page-user-form').style.display = 'block';
                break;
            case 'profile':
                this.renderProfile(extraParam);
                document.getElementById('page-profile').style.display = 'block';
                break;
            case 'activity':
                this.renderActivityLogs();
                document.getElementById('page-activity').style.display = 'block';
                break;
            case 'settings':
                this.loadSettingsForm();
                document.getElementById('page-settings').style.display = 'block';
                break;
            default:
                document.getElementById('page-404').style.display = 'block';
                break;
        }
    }

    renderDashboard() {
        // Stats
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newThisMonth = this.users.filter(u => new Date(u.created_at) >= firstOfMonth).length;
        document.getElementById('stat-total').innerText = this.users.length;
        document.getElementById('stat-month').innerText = newThisMonth;

        // Filters & Searching
        let filtered = this.users.filter(u => 
            u.name.toLowerCase().includes(this.filterQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(this.filterQuery.toLowerCase())
        );

        document.getElementById('stat-matching').innerText = filtered.length;

        // Sorting
        filtered.sort((a, b) => {
            let valA = a[this.sortBy];
            let valB = b[this.sortBy];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const perPage = parseInt(this.settings.page_size);
        const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
        this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);

        const start = (this.currentPage - 1) * perPage;
        const pageUsers = filtered.slice(start, start + perPage);

        // Render Table Body
        const tbody = document.getElementById('user-table-body');
        tbody.innerHTML = '';

        if (pageUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding: 40px;">
                        <strong>No users found</strong>
                        <p style="color: var(--text-sub);">Try another search or add a new user.</p>
                    </td>
                </tr>`;
        } else {
            pageUsers.forEach(user => {
                const dateObj = new Date(user.created_at);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="id-cell">#${user.id}</td>
                    <td>
                        <div class="user-cell">
                            <span class="avatar">${user.name.charAt(0).toUpperCase()}</span>
                            <strong>${this.escapeHtml(user.name)}</strong>
                        </div>
                    </td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td>
                        <span class="date-main">${formattedDate}</span>
                        <small style="display:block; color:var(--text-sub);">${formattedTime}</small>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button class="icon-button" onclick="app.showPage('profile', ${user.id})" title="View profile">◎</button>
                            <button class="icon-button" onclick="app.showPage('add-user', ${user.id})" title="Edit user">✎</button>
                            <button class="icon-button delete" onclick="app.deleteUser(${user.id})" title="Delete user">×</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Pagination footer
        const showingStart = filtered.length ? start + 1 : 0;
        const showingEnd = Math.min(start + perPage, filtered.length);
        document.getElementById('record-count-text').innerText = `Showing ${showingStart}–${showingEnd} of ${filtered.length} records`;
        document.getElementById('page-indicator').innerText = `${this.currentPage} / ${totalPages}`;
        document.getElementById('btn-prev').disabled = this.currentPage <= 1;
        document.getElementById('btn-next').disabled = this.currentPage >= totalPages;
    }

    handleFilterChange() {
        this.filterQuery = document.getElementById('search-input').value;
        this.sortBy = document.getElementById('sort-select').value;
        this.sortDirection = document.getElementById('direction-select').value;
        this.currentPage = 1;
        this.renderDashboard();
    }

    resetFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('sort-select').value = 'created_at';
        document.getElementById('direction-select').value = 'desc';
        this.handleFilterChange();
    }

    changePage(delta) {
        this.currentPage += delta;
        this.renderDashboard();
    }

    setupUserForm(userId = null) {
        const errorDiv = document.getElementById('form-error');
        errorDiv.style.display = 'none';

        if (userId) {
            const user = this.users.find(u => u.id === userId);
            if (!user) return this.showPage('404');

            document.getElementById('form-tag').innerText = 'EDIT ENTRY';
            document.getElementById('form-title').innerHTML = 'Edit User<span class="title-dot">.</span>';
            document.getElementById('form-subtitle').innerText = `Update record #${user.id}`;
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('form-submit-btn').innerText = '✓ Save Changes';
        } else {
            document.getElementById('form-tag').innerText = 'NEW DATABASE ENTRY';
            document.getElementById('form-title').innerHTML = 'Add User<span class="title-dot">.</span>';
            document.getElementById('form-subtitle').innerText = 'Create a new user record.';
            document.getElementById('user-id').value = '';
            document.getElementById('user-name').value = '';
            document.getElementById('user-email').value = '';
            document.getElementById('form-submit-btn').innerText = '＋ Create User';
        }
    }

    saveUser(e) {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const errorDiv = document.getElementById('form-error');

        if (!name || !email) {
            errorDiv.innerText = 'Please complete both fields.';
            errorDiv.style.display = 'block';
            return;
        }

        if (id) {
            // Edit User
            const user = this.users.find(u => u.id === parseInt(id));
            if (user) {
                user.name = name;
                user.email = email;
                this.addLog('UPDATE', `Updated user #${id}: ${name}`);
                this.saveData();
                this.showPage('dashboard');
                this.showNotice('User updated successfully.');
            }
        } else {
            // Add User
            const newId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
            this.users.push({
                id: newId,
                name: name,
                email: email,
                created_at: new Date().toISOString()
            });
            this.addLog('CREATE', `Created user: ${name}`);
            this.saveData();
            this.showPage('dashboard');
            this.showNotice('User added successfully.');
        }
    }

    deleteUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user && confirm('Delete this user? This cannot be undone.')) {
            this.users = this.users.filter(u => u.id !== id);
            this.addLog('DELETE', `Deleted user #${id}: ${user.name}`);
            this.saveData();
            this.renderDashboard();
            this.showNotice('User deleted successfully.');
        }
    }

    renderProfile(id) {
        const user = this.users.find(u => u.id === id);
        if (!user) return this.showPage('404');

        document.getElementById('profile-avatar').innerText = user.name.charAt(0).toUpperCase();
        document.getElementById('profile-name').innerHTML = `${this.escapeHtml(user.name)}<span class="title-dot">.</span>`;
        document.getElementById('profile-id-text').innerText = `User ID: #${user.id}`;
        document.getElementById('profile-detail-name').innerText = user.name;
        document.getElementById('profile-detail-email').innerText = user.email;
        document.getElementById('profile-detail-date').innerText = new Date(user.created_at).toLocaleString();

        document.getElementById('profile-edit-btn').onclick = () => this.showPage('add-user', user.id);
    }

    renderActivityLogs() {
        document.getElementById('activity-total-count').innerText = this.logs.length;
        const container = document.getElementById('activity-log-list');
        container.innerHTML = '';

        if (this.logs.length === 0) {
            container.innerHTML = '<p>No activity recorded yet.</p>';
            return;
        }

        this.logs.forEach(log => {
            const div = document.createElement('div');
            div.style.cssText = "padding:14px 0; border-bottom:1px solid #263248";
            div.innerHTML = `
                <strong>${this.escapeHtml(log.action)}</strong>
                <p>${this.escapeHtml(log.details)}</p>
                <small style="color:#8998b1">${log.created_at} · Event #${log.id}</small>
            `;
            container.appendChild(div);
        });
    }

    loadSettingsForm() {
        document.getElementById('setting-theme').value = this.settings.theme;
        document.getElementById('setting-pagesize').value = this.settings.page_size;
    }

    saveSettings(e) {
        e.preventDefault();
        this.settings.theme = document.getElementById('setting-theme').value;
        this.settings.page_size = document.getElementById('setting-pagesize').value;

        this.saveData();

        const notice = document.getElementById('settings-notice');
        notice.innerText = 'Settings saved for this session.';
        notice.style.display = 'block';
        setTimeout(() => { notice.style.display = 'none'; }, 3000);
    }

    exportCSV() {
        let csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Date Created\n";
        this.users.forEach(u => {
            csvContent += `${u.id},"${u.name}","${u.email}","${u.created_at}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users-export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }
}

// Initialize the app on page launch
const app = new NexusApp();