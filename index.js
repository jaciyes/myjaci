// Initial Sample Users Data
const INITIAL_USERS = [
    { id: "NXS-1001", name: "Elena Rostova", email: "elena.rostova@nexus.io", createdAt: "2026-03-15T10:30:00.000Z" },
    { id: "NXS-1002", name: "Marcus Chen", email: "marcus.chen@nexus.io", createdAt: "2026-03-18T14:22:00.000Z" },
    { id: "NXS-1003", name: "Aria Sterling", email: "aria.sterling@nexus.io", createdAt: "2026-03-20T09:15:00.000Z" },
    { id: "NXS-1004", name: "Kaelen Voss", email: "kaelen.voss@nexus.io", createdAt: "2026-03-22T16:45:00.000Z" },
    { id: "NXS-1005", name: "Sophia Martinez", email: "sophia.m@nexus.io", createdAt: "2026-03-25T11:05:00.000Z" },
    { id: "NXS-1006", name: "David Kim", email: "dkim@nexus.io", createdAt: "2026-04-01T08:00:00.000Z" },
    { id: "NXS-1007", name: "Olivia Taylor", email: "olivia.t@nexus.io", createdAt: "2026-04-02T13:40:00.000Z" },
    { id: "NXS-1008", name: "Lucas Wright", email: "lwright@nexus.io", createdAt: "2026-04-05T17:10:00.000Z" }
  ];
  
  // State Variables
  let users = [];
  let activityLogs = [];
  let currentPage = 1;
  let rowsPerPage = 8;
  let searchQuery = "";
  let sortField = "createdAt";
  let sortDirection = "desc"; // 'asc' or 'desc'
  let userToDeleteId = null;
  
  // View Titles Mapping
  const viewTitles = {
    dashboard: "Dashboard",
    adduser: "User Registration Form",
    activity: "Activity Audit Logs",
    settings: "System Preferences",
    profile: "Admin Profile"
  };
  
  // Initialization
  window.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();
    renderDashboard();
    renderActivityLogs();
    document.getElementById('lastLoginTime').innerText = new Date().toLocaleString();
    logActivity("SYSTEM", "Initialized NEXUS Control Center environment.");
  });
  
  // LocalStorage Synchronization
  function loadStateFromLocalStorage() {
    const storedUsers = localStorage.getItem('nexus_users');
    if (storedUsers) {
      try { users = JSON.parse(storedUsers); } catch(e) { users = INITIAL_USERS; }
    } else {
      users = [...INITIAL_USERS];
      saveUsersToLocalStorage();
    }
  
    const storedLogs = localStorage.getItem('nexus_activity_logs');
    if (storedLogs) {
      try { activityLogs = JSON.parse(storedLogs); } catch(e) { activityLogs = []; }
    }
  
    const storedSettings = localStorage.getItem('nexus_settings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        rowsPerPage = parseInt(settings.rowsPerPage) || 8;
        document.getElementById('settingRowsPerPage').value = rowsPerPage;
      } catch(e) {}
    }
  }
  
  function saveUsersToLocalStorage() {
    localStorage.setItem('nexus_users', JSON.stringify(users));
  }
  
  function saveLogsToLocalStorage() {
    localStorage.setItem('nexus_activity_logs', JSON.stringify(activityLogs));
  }
  
  // Navigation Switcher
  function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(view => view.classList.add('hidden'));
    
    // Deactivate all nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.remove('bg-blue-600/10', 'text-blue-400', 'border', 'border-blue-500/20');
      btn.classList.add('text-slate-400', 'hover:text-slate-200');
    });
  
    // Show selected view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.remove('hidden');
  
    // Highlight active nav button
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
      activeNav.classList.add('bg-blue-600/10', 'text-blue-400', 'border', 'border-blue-500/20');
      activeNav.classList.remove('text-slate-400');
    }
  
    // Update Top Header Title
    document.getElementById('viewTitle').innerText = viewTitles[viewId] || 'Dashboard';
  
    // Close mobile drawer if open
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('mobileOverlay').classList.add('hidden');
  
    // Refresh data if switching to dashboard or activity
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'activity') renderActivityLogs();
  }
  
  function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  }
  
  // Activity Logging
  function logActivity(actionTag, description) {
    const newLog = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      tag: actionTag,
      description: description,
      timestamp: new Date().toISOString()
    };
    activityLogs.unshift(newLog); // Add to top
    if (activityLogs.length > 50) activityLogs.pop(); // Cap log memory
    saveLogsToLocalStorage();
  }
  
  function renderActivityLogs() {
    const container = document.getElementById('activityLogContainer');
    if (!activityLogs.length) {
      container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500 font-mono">No activity logs recorded yet.</div>`;
      return;
    }
  
    container.innerHTML = activityLogs.map(log => {
      let tagColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      if (log.tag === 'CREATE') tagColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      if (log.tag === 'UPDATE') tagColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      if (log.tag === 'DELETE') tagColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      if (log.tag === 'EXPORT') tagColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
  
      const formattedDate = new Date(log.timestamp).toLocaleString();
  
      return `
        <div class="bg-[#070d17] p-3.5 rounded-xl border border-[#1e293b] flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${tagColor}">
              ${log.tag}
            </span>
            <span class="text-xs text-slate-200">${log.description}</span>
          </div>
          <div class="text-[10px] text-slate-500 font-mono shrink-0">
            ${formattedDate}
          </div>
        </div>
      `;
    }).join('');
  }
  
  function clearActivityLogs() {
    activityLogs = [];
    saveLogsToLocalStorage();
    renderActivityLogs();
    showToast("Activity logs cleared", "info");
  }
  
  // Filter, Search, & Sorting Logic
  function getProcessedUsers() {
    let result = users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
  
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
  
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    return result;
  }
  
  function handleSearch() {
    searchQuery = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    renderDashboard();
  }
  
  function handleSortChange() {
    sortField = document.getElementById('sortField').value;
    renderDashboard();
  }
  
  function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    document.getElementById('sortDirText').innerText = sortDirection === 'asc' ? 'Asc' : 'Desc';
    document.getElementById('sortDirIcon').className = sortDirection === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short';
    renderDashboard();
  }
  
  // Dashboard Render Logic
  function renderDashboard() {
    const filteredUsers = getProcessedUsers();
  
    // Update Statistics Cards
    document.getElementById('statTotalUsers').innerText = users.length;
    document.getElementById('statFiltered').innerText = filteredUsers.length;
  
    // Calculate "New This Month"
    const now = new Date();
    const newThisMonth = users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('statNewMonth').innerText = newThisMonth;
  
    // Calculate Pagination
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
  
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  
    // Render Users Table Body
    const tbody = document.getElementById('usersTableBody');
    if (paginatedUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-12 text-slate-500 text-xs font-mono">
            <i class="fa-solid fa-folder-open text-2xl mb-2 block"></i>
            No users matching your search criteria.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = paginatedUsers.map(u => {
        const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';
        const formattedDate = new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  
        return `
          <tr class="hover:bg-[#162032]/50 transition">
            <td class="py-3.5 px-6 font-medium text-white flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                ${initials}
              </div>
              <div>
                <div class="text-slate-100 font-semibold">${escapeHtml(u.name)}</div>
              </div>
            </td>
            <td class="py-3.5 px-6 font-mono text-xs text-blue-400">${u.id}</td>
            <td class="py-3.5 px-6 text-slate-300 font-mono text-xs">${escapeHtml(u.email)}</td>
            <td class="py-3.5 px-6 text-slate-400 text-xs font-mono">${formattedDate}</td>
            <td class="py-3.5 px-6 text-right space-x-2">
              <button onclick="editUser('${u.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 transition" title="Edit User">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="promptDeleteUser('${u.id}', '${escapeHtml(u.name)}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition" title="Delete User">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  
    // Update Pagination Controls
    const endItem = Math.min(startIndex + rowsPerPage, filteredUsers.length);
    document.getElementById('paginationInfo').innerText = `Showing ${filteredUsers.length ? startIndex + 1 : 0}-${endItem} of ${filteredUsers.length} users`;
  
    document.getElementById('btnPrevPage').disabled = currentPage <= 1;
    document.getElementById('btnNextPage').disabled = currentPage >= totalPages;
  
    // Pagination Number Buttons
    const pageNumbersContainer = document.getElementById('pageNumbers');
    let pageBtnsHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        pageBtnsHTML += `<button class="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold font-mono">${i}</button>`;
      } else {
        pageBtnsHTML += `<button onclick="goToPage(${i})" class="w-7 h-7 rounded-lg border border-[#1e293b] bg-[#070d17] text-slate-400 hover:text-white font-mono">${i}</button>`;
      }
    }
    pageNumbersContainer.innerHTML = pageBtnsHTML;
  }
  
  function changePage(direction) {
    currentPage += direction;
    renderDashboard();
  }
  
  function goToPage(page) {
    currentPage = page;
    renderDashboard();
  }
  
  // CRUD: Add / Edit User Form Handlers
  function editUser(userId) {
    const u = users.find(user => user.id === userId);
    if (!u) return;
  
    document.getElementById('editUserId').value = u.id;
    document.getElementById('inputName').value = u.name;
    document.getElementById('inputEmail').value = u.email;
  
    document.getElementById('formHeaderTitle').innerText = "Edit User Details";
    document.getElementById('submitBtnText').innerText = "Update User";
  
    switchView('adduser');
  }
  
  function cancelForm() {
    document.getElementById('userForm').reset();
    document.getElementById('editUserId').value = "";
    document.getElementById('formHeaderTitle').innerText = "Create New User";
    document.getElementById('submitBtnText').innerText = "Save User";
    switchView('dashboard');
  }
  
  function handleUserSubmit(e) {
    e.preventDefault();
  
    const editId = document.getElementById('editUserId').value;
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
  
    if (!name || !email) return;
  
    if (editId) {
      // Update Existing
      const index = users.findIndex(u => u.id === editId);
      if (index !== -1) {
        users[index].name = name;
        users[index].email = email;
        saveUsersToLocalStorage();
        logActivity("UPDATE", `Updated details for user ${editId} (${name}).`);
        showToast(`User ${name} updated successfully.`, "success");
      }
    } else {
      // Create New User
      const newId = 'NXS-' + Math.floor(1000 + Math.random() * 9000);
      const newUser = {
        id: newId,
        name: name,
        email: email,
        createdAt: new Date().toISOString()
      };
      users.unshift(newUser);
      saveUsersToLocalStorage();
      logActivity("CREATE", `Created new user ${newId} (${name}).`);
      showToast(`User ${name} created successfully.`, "success");
    }
  
    cancelForm();
  }
  
  // CRUD: Delete User Modal Handlers
  function promptDeleteUser(userId, userName) {
    userToDeleteId = userId;
    document.getElementById('deleteUserName').innerText = userName;
    document.getElementById('deleteModal').classList.remove('hidden');
  }
  
  function closeDeleteModal() {
    userToDeleteId = null;
    document.getElementById('deleteModal').classList.add('hidden');
  }
  
  function confirmUserDelete() {
    if (!userToDeleteId) return;
  
    const user = users.find(u => u.id === userToDeleteId);
    const userName = user ? user.name : userToDeleteId;
  
    users = users.filter(u => u.id !== userToDeleteId);
    saveUsersToLocalStorage();
  
    logActivity("DELETE", `Deleted user ${userToDeleteId} (${userName}).`);
    showToast(`User ${userName} deleted.`, "error");
  
    closeDeleteModal();
    renderDashboard();
  }
  
  // Export CSV Feature
  function exportCSV() {
    if (users.length === 0) {
      showToast("No user data available to export.", "info");
      return;
    }
  
    const headers = ["User ID", "Full Name", "Email Address", "Created At"];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.createdAt}"`
    ]);
  
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus-users-export-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    logActivity("EXPORT", `Exported ${users.length} users to CSV.`);
    showToast("CSV Export downloaded successfully.", "success");
  }
  
  // Settings Handler
  function saveSettings(e) {
    e.preventDefault();
    const selectedRows = parseInt(document.getElementById('settingRowsPerPage').value);
    rowsPerPage = selectedRows;
  
    localStorage.setItem('nexus_settings', JSON.stringify({
      rowsPerPage: rowsPerPage
    }));
  
    logActivity("SETTINGS", `Updated preferences: Rows per page set to ${rowsPerPage}.`);
    showToast("Preferences saved successfully.", "success");
    switchView('dashboard');
  }
  
  // Utility: Toast Notification System
  function showToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
  
    let borderBg = "border-emerald-500/40 bg-[#0f172a] text-emerald-400";
    let icon = "fa-circle-check";
  
    if (type === "error") {
      borderBg = "border-rose-500/40 bg-[#0f172a] text-rose-400";
      icon = "fa-circle-exclamation";
    } else if (type === "info") {
      borderBg = "border-blue-500/40 bg-[#0f172a] text-blue-400";
      icon = "fa-circle-info";
    }
  
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${borderBg} shadow-xl text-xs font-medium transform transition duration-300 translate-y-2 opacity-0`;
    toast.innerHTML = `
      <i class="fa-solid ${icon} text-base"></i>
      <span class="text-slate-200">${escapeHtml(message)}</span>
    `;
  
    container.appendChild(toast);
  
    // Trigger animation
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
  
    // Auto Dismiss
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  
  // Utility: HTML Escaper
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }