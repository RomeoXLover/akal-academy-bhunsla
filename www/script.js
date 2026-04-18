const STORAGE_KEY = "akal_academy_bhunsla_portal_v2";
const REMEMBER_KEY = "akal_academy_bhunsla_remember";
const TODAY = new Date().toISOString().split("T")[0];

// ── Cloud Sync Config ─────────────────────────────────────────────────────────
const API_BASE = "https://akal-academy-bhunsla.vercel.app";
// ─────────────────────────────────────────────────────────────────────────────


let appState = null;
let currentUser = null;
let selectedTerm = "Pre-mid";
let timetableEditMode = false;
let currentSyllabusUpload = null;
let currentManagedTestId = "";
let currentTestsClass = "";
let currentExamClass = "";
let testsMode = "pending";
let _cloudSha = null;   // tracks GitHub file SHA for updates
let _syncing = false;   // prevents double-saves
let _pollInterval = null;

const ACCESS_MAP = {
    Operator: ["Full school control", "Can manage users, marks, tests, homework, timetable and syllabus", "Can bypass all subject restrictions"],
    Principal: ["Full school control (minus admin config)", "Can manage users, marks, tests, homework, timetable and syllabus", "Can bypass all subject restrictions"],
    Teacher: ["Can create and edit class tests and homework", "Can manage student records and marks for own subjects", "Cannot create test results outside subject"],
    Major: ["School-wide oversight (restricted)", "Can review classes, students, tests and exam results", "Cannot create or modify marks"],
    Student: ["Can view class work and results", "Can edit own profile only", "No Major Access permission"]
};

const LANGUAGE_LABELS = {
    en: { 
        overview: "Overview", tests: "Tests", "tests-result-classes": "Tests Result", "test-manage": "Test Details", 
        "exam-result-classes": "Exam Results", results: "My Results", homework: "Homework", students: "Students", search: "Search Info", 
        syllabus: "Syllabus", timetable: "Timetable", profile: "Profile", settings: "Settings", major: "Major Access"
    },
    hi: { 
        overview: "Ã Â¤â€¦Ã Â¤ÂµÃ Â¤Â²Ã Â¥â€¹Ã Â¤â€¢Ã Â¤Â¨", tests: "Ã Â¤ÂªÃ Â¤Â°Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾", "tests-result-classes": "Ã Â¤ÂªÃ Â¤Â°Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â£Ã Â¤Â¾Ã Â¤Â®", "test-manage": "Ã Â¤ÂªÃ Â¤Â°Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤ÂµÃ Â¤Â°Ã Â¤Â£", 
        "exam-result-classes": "Ã Â¤ÂªÃ Â¤Â°Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â£Ã Â¤Â¾Ã Â¤Â®", results: "Ã Â¤Â®Ã Â¥â€¡Ã Â¤Â°Ã Â¥â€¡ Ã Â¤ÂªÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â£Ã Â¤Â¾Ã Â¤Â®", homework: "Ã Â¤â€”Ã Â¥Æ’Ã Â¤Â¹Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¯", students: "Ã Â¤â€ºÃ Â¤Â¾Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°", search: "Ã Â¤â€“Ã Â¥â€¹Ã Â¤Å“", 
        syllabus: "Ã Â¤ÂªÃ Â¤Â¾Ã Â¤Â Ã Â¥ÂÃ Â¤Â¯Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â°Ã Â¤Â®", timetable: "Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¯ Ã Â¤Â¸Ã Â¤Â¾Ã Â¤Â°Ã Â¤Â£Ã Â¥â‚¬", profile: "Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¥â€¹Ã Â¤Â«Ã Â¤Â¼Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â²", settings: "Ã Â¤Â¸Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¿Ã Â¤â€šÃ Â¤â€”Ã Â¥ÂÃ Â¤Â¸", major: "Ã Â¤Â®Ã Â¥ÂÃ Â¤â€“Ã Â¥ÂÃ Â¤Â¯ Ã Â¤ÂªÃ Â¤Â¹Ã Â¥ÂÃ Â¤â€šÃ Â¤Å¡"
    },
    pa: { 
        overview: "Ã Â¨Â¸Ã Â©Â°Ã Â¨â€“Ã Â©â€¡Ã Â¨Âª", tests: "Ã Â¨Å¸Ã Â©Ë†Ã Â¨Â¸Ã Â¨Å¸", "tests-result-classes": "Ã Â¨Å¸Ã Â©Ë†Ã Â¨Â¸Ã Â¨Å¸ Ã Â¨Â¨Ã Â¨Â¤Ã Â©â‚¬Ã Â¨Å“Ã Â¨Â¾", "test-manage": "Ã Â¨Å¸Ã Â©Ë†Ã Â¨Â¸Ã Â¨Å¸ Ã Â¨ÂµÃ Â©â€¡Ã Â¨Â°Ã Â¨ÂµÃ Â¨Â¾", 
        "exam-result-classes": "Ã Â¨ÂªÃ Â©ÂÃ Â¨Â°Ã Â©â‚¬Ã Â¨â€“Ã Â¨Â¿Ã Â¨â€  Ã Â¨Â¨Ã Â¨Â¤Ã Â©â‚¬Ã Â¨Å“Ã Â©â€¡", results: "Ã Â¨Â®Ã Â©â€¡Ã Â¨Â°Ã Â©â€¡ Ã Â¨Â¨Ã Â¨Â¤Ã Â©â‚¬Ã Â¨Å“Ã Â©â€¡", homework: "Ã Â¨Â¹Ã Â©â€¹Ã Â¨Â®Ã Â¨ÂµÃ Â¨Â°Ã Â¨â€¢", students: "Ã Â¨ÂµÃ Â¨Â¿Ã Â¨Â¦Ã Â¨Â¿Ã Â¨â€ Ã Â¨Â°Ã Â¨Â¥Ã Â©â‚¬", search: "Ã Â¨â€“Ã Â©â€¹Ã Â¨Å“", 
        syllabus: "Ã Â¨Â¸Ã Â¨Â¿Ã Â¨Â²Ã Â©â€¡Ã Â¨Â¬Ã Â¨Â¸", timetable: "Ã Â¨Â¸Ã Â¨Â®Ã Â¨Â¾Ã Â¨â€š Ã Â¨Â¸Ã Â¨Â¾Ã Â¨Â°Ã Â¨Â£Ã Â©â‚¬", profile: "Ã Â¨ÂªÃ Â©ÂÃ Â¨Â°Ã Â©â€¹Ã Â¨Â«Ã Â¨Â¾Ã Â¨Ë†Ã Â¨Â²", settings: "Ã Â¨Â¸Ã Â©Ë†Ã Â¨Å¸Ã Â¨Â¿Ã Â©Â°Ã Â¨â€”Ã Â¨Â¾Ã Â¨â€š", major: "Ã Â¨Â®Ã Â©ÂÃ Â©Â±Ã Â¨â€“ Ã Â¨ÂªÃ Â¨Â¹Ã Â©ÂÃ Â©Â°Ã Â¨Å¡"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    bootApp();
    bindEvents();
});

function bootApp() {
    const stored = localStorage.getItem(STORAGE_KEY);
    appState = stored ? JSON.parse(stored) : structuredClone(window.INITIAL_STATE);
    selectedTerm = appState.examTypes[0];
    syncDataShape();
    renderTermTabs();
    populateResultForm();
    document.getElementById("language-select").value = appState.settings.language || "en";
    applyLanguage();

    // Try loading from cloud first, then handle remember-me
    loadFromCloud(function() {
        selectedTerm = appState.examTypes[0];
        renderTermTabs();
        populateResultForm();
        document.getElementById("language-select").value = appState.settings.language || "en";
        applyLanguage();

        var rememberedRaw = localStorage.getItem(REMEMBER_KEY);
        if (rememberedRaw) {
            try {
                var remembered = JSON.parse(rememberedRaw);
                var userId = remembered && remembered.userId;
                var expiry = remembered && remembered.expiry;
                if (expiry && Date.now() < expiry && userId) {
                    var user = appState.users.find(function(u){ return u.id === userId; });
                    if (user) { loginAs(user); startCloudPolling(); }
                    else localStorage.removeItem(REMEMBER_KEY);
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }
            } catch (e) {
                localStorage.removeItem(REMEMBER_KEY);
            }
        }
    });

    setTimeout(() => {
        document.getElementById("splash-screen").classList.add("fade-out");
    }, 2200);
}

function bindEvents() {
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    document.getElementById("logout-btn").addEventListener("click", handleLogout);
    document.getElementById("profile-form").addEventListener("submit", saveProfile);
    document.getElementById("major-search").addEventListener("input", renderMajorAccess);
    document.getElementById("search-input").addEventListener("input", renderTeacherSearch);
    document.getElementById("results-mode").addEventListener("change", renderResults);
    document.getElementById("new-result-btn").addEventListener("click", () => openResultModal());
    document.getElementById("new-user-btn").addEventListener("click", () => openUserModal());
    document.getElementById("close-modal-btn").addEventListener("click", closeUserModal);
    document.getElementById("user-form").addEventListener("submit", saveUserRecord);
    document.getElementById("new-test-btn").addEventListener("click", () => openTaskModal("test"));
    document.getElementById("new-homework-btn").addEventListener("click", () => openTaskModal("homework"));
    document.getElementById("close-task-btn").addEventListener("click", closeTaskModal);
    document.getElementById("task-form").addEventListener("submit", saveTaskRecord);
    document.getElementById("test-date-filter").addEventListener("input", renderTests);
    document.getElementById("homework-date-filter").addEventListener("input", renderHomework);
    document.getElementById("back-to-test-results").addEventListener("click", () => showView("tests-result-classes"));
    document.getElementById("test-student-search").addEventListener("input", renderManagedTestStudents);
    document.getElementById("new-syllabus-btn").addEventListener("click", () => openSyllabusModal());
    document.getElementById("close-syllabus-btn").addEventListener("click", closeSyllabusModal);
    document.getElementById("syllabus-form").addEventListener("submit", saveSyllabusRecord);
    document.getElementById("syllabus-type").addEventListener("change", syncSyllabusMode);
    document.getElementById("syllabus-file").addEventListener("change", handleSyllabusFileChange);
    document.getElementById("language-select").addEventListener("change", changeLanguage);
    document.getElementById("student-search").addEventListener("input", renderStudentsView);
    document.getElementById("rename-timetable-btn").addEventListener("click", renameTimetableHeader);
    document.getElementById("add-day-btn").addEventListener("click", addTimetableDay);
    document.getElementById("add-period-btn").addEventListener("click", addTimetablePeriod);
    document.getElementById("save-timetable-btn").addEventListener("click", saveTimetable);
    document.getElementById("toggle-edit-mode-btn").addEventListener("click", toggleTimetableEditMode);
    document.getElementById("close-result-btn").addEventListener("click", closeResultModal);
    document.getElementById("result-form").addEventListener("submit", saveResultRecord);
    document.getElementById("result-student-search").addEventListener("input", syncResultStudentFromSearch);
    document.getElementById("result-student").addEventListener("change", syncResultStudentMeta);
    document.getElementById("close-viewer-btn").addEventListener("click", closeViewer);
    document.getElementById("close-student-viewer-btn").addEventListener("click", closeStudentViewer);
    document.getElementById("test-student-marks-form").addEventListener("submit", saveTestStudentMarks);
    document.getElementById("tsm-absent-btn").addEventListener("click", setTestStudentAbsent);
    document.getElementById("tsm-delete-btn").addEventListener("click", deleteTestStudentScore);
    document.querySelectorAll(".tool-btn").forEach((button) =>
        button.addEventListener("click", (e) => {
            e.preventDefault();
            document.execCommand(button.dataset.tool, false, null);
        })
    );
    document.getElementById("back-to-exam-students").addEventListener("click", () => showView("exam-result-students"));

    document.querySelectorAll(".nav-item[data-view]").forEach((item) =>
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            if (view) showView(view);
        })
    );

    const testsTabs = document.getElementById("test-mode-tabs");
    if (testsTabs) {
        testsTabs.addEventListener("click", (e) => {
            const btn = e.target && e.target.closest && e.target.closest("[data-test-mode]");
            if (!btn) return;
            testsMode = btn.dataset.testMode || "pending";
            testsTabs.querySelectorAll("[data-test-mode]").forEach((b) => b.classList.toggle("active", b === btn));
            renderTests();
        });
    }
}

function syncDataShape() {
    appState.settings = appState.settings || { language: "en" };
    appState.notifications = appState.notifications || [];
    appState.tests = (appState.tests || []).map((item) => ({ minMarks: 0, maxMarks: 0, passMarks: 0, scores: [], completed: false, ...item }));
    appState.results = (appState.results || []).map((item) => ({ internal: 0, internalMax: 0, ...item }));
    appState.syllabus = (appState.syllabus || []).map((item) => ({ type: "text", fileName: "", fileData: "", ...item, content: item.content || "<p></p>" }));
    appState.timetable.periods = (appState.timetable.periods || []).map((item) => ({ label: item.label, cells: item.cells || item.slots || [] }));

    appState.homework = (appState.homework || []).map((item) => {
        var autoRemoveDays = Math.max(1, Number(item.autoRemoveDays || 1));
        var expiresAt = item.expiresAt || addDays(item.date || TODAY, autoRemoveDays);
        return Object.assign({}, item, { autoRemoveDays: autoRemoveDays, expiresAt: expiresAt, completed: false });
    }).filter(function(item) {
        return (item.expiresAt || TODAY) >= TODAY;
    });
}

// ─── Notification System ─────────────────────────────────────────────────────

function addNotification(type, message, targetClass, targetStudentId) {
    var notif = {
        id: "n" + Date.now() + Math.floor(Math.random() * 1000),
        type: type,
        message: message,
        targetClass: targetClass || null,
        targetStudentId: targetStudentId || null,
        createdAt: new Date().toISOString(),
        readBy: []
    };
    appState.notifications = appState.notifications || [];
    appState.notifications.unshift(notif);
    // Keep max 100 notifications
    if (appState.notifications.length > 100) appState.notifications = appState.notifications.slice(0, 100);
    persist();
    renderNotificationBell();
    // Fire real OS notification
    var typeLabels = { test: "📝 New Test", homework: "📚 New Homework", result: "🏆 Exam Result", marks: "✏️ Marks Entered", absent: "⚠️ Absence Marked", syllabus: "📖 Syllabus" };
    showNativeNotification(typeLabels[type] || "🔔 Akal Academy", message);
}

function getVisibleNotifications() {
    if (!currentUser || !appState.notifications) return [];
    return appState.notifications.filter(function(n) {
        // Operator and Principal see everything
        if (currentUser.role === "Operator" || currentUser.role === "Principal") return true;
        // Specific student notification
        if (n.targetStudentId && n.targetStudentId === currentUser.id) return true;
        // Class-wide notification - matches role
        if (n.targetClass && !n.targetStudentId) {
            if (currentUser.role === "Student") return currentUser.class === n.targetClass;
            if (currentUser.role === "Teacher") {
                var cls = currentUser.classes || (currentUser.class ? [currentUser.class] : []);
                return cls.indexOf(n.targetClass) !== -1;
            }
            return true; // Major sees class notifications
        }
        // No target = global
        if (!n.targetClass && !n.targetStudentId) return true;
        return false;
    });
}

function isNotifUnread(notif) {
    return !notif.readBy || notif.readBy.indexOf(currentUser.id) === -1;
}

function renderNotificationBell() {
    var badge = document.getElementById("notif-badge");
    var bell = document.getElementById("notif-bell");
    if (!badge || !bell) return;
    var unreadCount = getVisibleNotifications().filter(isNotifUnread).length;
    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
    badge.classList.toggle("hidden", unreadCount === 0);
    bell.classList.toggle("has-unread", unreadCount > 0);
}

function renderNotificationPanel() {
    var list = document.getElementById("notif-list");
    if (!list) return;
    var notifs = getVisibleNotifications();
    if (!notifs.length) {
        list.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
        return;
    }
    var icons = { test: "📝", homework: "📚", result: "🏆", marks: "✏️", syllabus: "📖", absent: "⚠️" };
    list.innerHTML = notifs.slice(0, 30).map(function(n) {
        var unread = isNotifUnread(n);
        var icon = icons[n.type] || "🔔";
        var time = new Date(n.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
        return '<div class="notif-item ' + (unread ? "unread" : "") + '" onclick="readNotif(\'' + n.id + '\')">' +
            '<strong>' + icon + ' ' + n.message + '</strong>' +
            '<span>' + time + '</span>' +
            '</div>';
    }).join("");
}

window.toggleNotifPanel = function() {
    var panel = document.getElementById("notif-panel");
    if (!panel) return;
    var isHidden = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !isHidden);
    if (isHidden) renderNotificationPanel();
    // Close on outside click
    if (isHidden) {
        setTimeout(function() {
            document.addEventListener("click", function closePanel(e) {
                if (!document.getElementById("notif-panel").contains(e.target) &&
                    !document.getElementById("notif-bell").contains(e.target)) {
                    document.getElementById("notif-panel").classList.add("hidden");
                    document.removeEventListener("click", closePanel);
                }
            });
        }, 50);
    }
};

window.readNotif = function(id) {
    var notif = (appState.notifications || []).find(function(n){ return n.id === id; });
    if (notif && notif.readBy.indexOf(currentUser.id) === -1) {
        notif.readBy.push(currentUser.id);
        persist();
    }
    renderNotificationPanel();
    renderNotificationBell();
};

window.markAllNotifRead = function() {
    getVisibleNotifications().forEach(function(n) {
        if (n.readBy.indexOf(currentUser.id) === -1) n.readBy.push(currentUser.id);
    });
    persist();
    renderNotificationPanel();
    renderNotificationBell();
};
// ─── Native OS Notification helper ──────────────────────────────────────────
function showNativeNotification(title, body) {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    var options = { body: body, icon: "image.png", badge: "image.png", tag: title };
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(function(reg) {
            reg.showNotification(title, options);
        }).catch(function() { new Notification(title, options); });
    } else {
        new Notification(title, options);
    }
}
// ─────────────────────────────────────────────────────────────────────────────

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const rememberMe = document.getElementById("remember-me").checked;
    const error = document.getElementById("login-error");
    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = true;
    loginBtn.textContent = "Checking...";
    error.classList.add("hidden");

    setTimeout(() => {
        const user = appState.users.find((entry) => entry.username === username && entry.password === password);
        if (!user) {
            error.textContent = "Incorrect username or password.";
            error.classList.remove("hidden");
            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";
            toast("Incorrect username or password.", true);
            return;
        }

        if (rememberMe) {
            const expiry = Date.now() + 31 * 24 * 60 * 60 * 1000;
            localStorage.setItem(REMEMBER_KEY, JSON.stringify({ userId: user.id, expiry }));
        }

        loginAs(user);
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
    }, 600);
}

function loginAs(user) {
    currentUser = user;
    document.getElementById("portal-page").classList.remove("hidden");
    document.getElementById("login-page").classList.add("hidden");
    
    var isStudent = currentUser.role === "Student";
    var isMajor = currentUser.role === "Major";
    var isTeacher = currentUser.role === "Teacher";
    var isAdmin = currentUser.role === "Operator" || currentUser.role === "Principal";
    var canCreateResults = isAdmin || isTeacher || isMajor;
    
    // Sidebar nav visibility
    document.getElementById("major-nav").classList.toggle("hidden", !isAdmin);
    document.getElementById("students-nav").classList.toggle("hidden", isStudent);
    document.getElementById("tests-result-nav").classList.toggle("hidden", isStudent);
    document.getElementById("exam-results-nav").classList.toggle("hidden", isStudent);
    document.getElementById("results-nav").classList.toggle("hidden", !isStudent);
    
    // Action button visibility
    document.getElementById("new-test-btn").classList.toggle("hidden", isStudent || isMajor);
    document.getElementById("new-homework-btn").classList.toggle("hidden", isStudent || isMajor);
    document.getElementById("new-syllabus-btn").classList.toggle("hidden", !isAdmin);
    // Teacher and Major can now create exam results (multi-subject)
    document.getElementById("new-result-btn").classList.toggle("hidden", isStudent);
    
    document.getElementById("timetable-actions").classList.toggle("hidden", !isAdmin);
    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("user-role").textContent = currentUser.role;
    document.getElementById("sidebar-role").textContent = currentUser.role;

    renderPortal();
    showView("overview");
    renderNotificationBell();
    startCloudPolling(); // start syncing with school server
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
    }
    toast("Welcome " + currentUser.name);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(REMEMBER_KEY);
    // stop cloud polling
    if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null; }
    document.getElementById("portal-page").classList.add("hidden");
    document.getElementById("login-page").classList.remove("hidden");
    document.getElementById("login-form").reset();
    var loginBtn = document.getElementById("login-btn");
    if (loginBtn) { loginBtn.textContent = "Sign In"; loginBtn.disabled = false; }
}

function renderPortal() {
    applyLanguage();
    renderMetrics();
    renderAccessSummary();
    renderOverview();
    renderTests();
    renderTestsResultClasses();
    renderExamResultClasses();
    renderResults();
    renderHomework();
    renderStudentsView();
    renderTeacherSearch();
    renderSyllabus();
    renderTimetable();
    renderProfile();
    renderMajorAccess();
    populateResultForm();
    applyRevealAnimations();
}

function showView(view) {
    document.querySelectorAll(".view-section").forEach(function(section) { section.classList.add("hidden"); });
    var target = document.getElementById("view-" + view);
    if (target) target.classList.remove("hidden");

    if (view === "overview") renderOverview();
    if (view === "tests") renderTests();
    if (view === "tests-result-classes") renderTestsResultClasses();
    if (view === "test-manage") renderManagedTestStudents();
    if (view === "exam-result-classes") renderExamResultClasses();
    if (view === "exam-result-students") renderExamResultStudents();
    if (view === "results") renderResults();
    if (view === "homework") renderHomework();
    if (view === "students") renderStudentsView();
    if (view === "search") renderTeacherSearch();
    if (view === "syllabus") renderSyllabus();
    if (view === "timetable") renderTimetable();
    if (view === "profile") renderProfile();
    if (view === "major") renderMajorAccess();

    // Trigger reveal animations for dynamically rendered cards
    setTimeout(applyRevealAnimations, 50);

    var labelKey = view;
    if (view.startsWith("tests-result") || view === "tests-result-list") labelKey = "tests-result-classes";
    if (view.startsWith("exam-result")) labelKey = "exam-result-classes";
    if (view === "test-manage") labelKey = "test-manage";

    document.getElementById("page-title").textContent = getLabel(labelKey) || "Portal";

    document.querySelectorAll(".nav-item[data-view]").forEach(function(item) {
        var isActive = item.dataset.view === view;
        if ((view === "tests-result-list" || view === "test-manage") && item.dataset.view === "tests-result-classes") isActive = true;
        if (view.startsWith("exam-result") && item.dataset.view === "exam-result-classes") isActive = true;
        item.classList.toggle("active", isActive);
    });
}

function renderMetrics() {
    document.getElementById("metric-total-users").textContent = appState.users.length;
    document.getElementById("metric-total-teachers").textContent = appState.users.filter((user) => user.role === "Teacher").length;
    document.getElementById("metric-total-students").textContent = appState.users.filter((user) => user.role === "Student").length;
    document.getElementById("metric-live-tests").textContent = getVisibleTests().filter((item) => isPending(item)).length;
}

function renderAccessSummary() {
    const root = document.getElementById("access-summary");
    const accessLines = (currentUser && ACCESS_MAP[currentUser.role]) ? ACCESS_MAP[currentUser.role] : [];
    root.innerHTML = accessLines.map((text) => `<article class="tag-item"><strong>${currentUser.role}</strong><span>${text}</span></article>`).join("")
        || `<article class="tag-item"><strong>${currentUser ? currentUser.role : "Role"}</strong><span>Access summary unavailable for this role.</span></article>`;
}

function renderOverview() {
    if (document.getElementById("overview-welcome")) {
        document.getElementById("overview-welcome").textContent = `${getLabel("welcome")}, ${currentUser.name}`;
    }
    document.getElementById("overview-subtext").textContent = `${currentUser.role} access is active. Monitor tests, homework, results and management from one place.`;

    const pendingRoot = document.getElementById("overview-pending");
    const pendingTests = getVisibleTests().filter((item) => isPending(item)).slice(0, 2).map((item) => `<article class="list-card compact-card"><strong>${item.title}</strong><p>${item.className} | ${formatDate(item.date)}</p></article>`);
    const pendingHomework = getVisibleHomework().slice(0, 2).map((item) => `<article class="list-card compact-card"><strong>${item.title}</strong><p>${item.className} | ${formatDate(item.date)}</p></article>`);
    pendingRoot.innerHTML = [...pendingTests, ...pendingHomework].join("") || `<article class="list-card compact-card"><strong>No pending work</strong><p>Everything is updated.</p></article>`;

    const activityRoot = document.getElementById("overview-activity");
    const latest = [...appState.tests, ...appState.homework].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((item) => `<article class="list-card compact-card"><strong>${item.title}</strong><p>${item.subject} | ${item.className} | ${formatDate(item.date)}</p></article>`);
    activityRoot.innerHTML = latest.join("");
}

function renderTests() {
    var allItems = getVisibleTests();
    var dateFilter = document.getElementById("test-date-filter").value;
    var items = dateFilter ? allItems.filter(function(i){ return i.date === dateFilter; }) : allItems;

    var pendingItems   = items.filter(function(i){ return !i.completed; });
    var completedItems = items.filter(function(i){ return  i.completed; });

    document.getElementById("tests-board").innerHTML =
        pendingItems.map(function(i){ return renderTaskCard(i, "test", false); }).join("") ||
        '<p class="panel-hint">No pending tests.</p>';

    document.getElementById("tests-archive").innerHTML =
        completedItems.map(function(i){ return renderTaskCard(i, "test", true); }).join("") ||
        '<p class="panel-hint">No completed tests.</p>';

    var board        = document.getElementById("tests-board");
    var archiveBlock = document.getElementById("tests-archive") && document.getElementById("tests-archive").parentElement;
    if (board)        board.classList.toggle("hidden",        testsMode !== "pending");
    if (archiveBlock) archiveBlock.classList.toggle("hidden", testsMode !== "completed");
}

function renderHomework() {
    const filterDate = document.getElementById("homework-date-filter").value;
    let items = getVisibleHomework();
    if (filterDate) items = items.filter(i => i.date === filterDate);
    
    document.getElementById("homework-board").innerHTML = items.map(i => renderTaskCard(i, "homework", false)).join("") || `<p class="panel-hint">No homework listed.</p>`;
    document.getElementById("homework-archive").innerHTML = `<p class="panel-hint">Homework auto-removes after its expiry time.</p>`;
}

function isPending(item) { return item.date >= TODAY && !item.completed; }

function renderTaskCard(item, kind, completed) {
    const owner = appState.users.find((user) => user.id === item.createdBy);
    const statusText = completed ? "&#9989; Completed" : "&#9203; Pending";
    const isHomework = kind === "homework";

    return `
        <article class="list-card reveal interactive-pop task-card task-card-${kind}">
            <div class="card-head-row">
                <strong>${item.title}</strong>
                <span class="mini-badge">${item.className} &bull; ${statusText}</span>
            </div>
            <p>${item.subject} | ${formatDate(item.date)} | ${owner ? owner.name : "School"}</p>
            <p>${item.desc}</p>
            <div class="action-buttons">
                <button class="action-btn edit-btn" type="button" onclick="viewTask('${kind}','${item.id}')">View</button>
                ${canManageTask(item) ? `
                    <button class="action-btn edit-btn" type="button" onclick="editTask('${kind}','${item.id}')">Edit</button>
                    ${isHomework ? "" : `<button class="action-btn edit-btn" type="button" onclick="toggleTaskCompletion('${kind}','${item.id}', ${!completed})">${completed ? "Set Pending" : "Set Completed"}</button>`}
                    <button class="action-btn delete-btn" type="button" onclick="deleteTask('${kind}','${item.id}')">Delete</button>
                ` : ""}
            </div>
        </article>
    `;
}

function canManageTask(item) {
    if (currentUser.role === "Operator" || currentUser.role === "Principal") return true;
    if (currentUser.role === "Teacher" && item.createdBy === currentUser.id) return true;
    return false;
}

function setTaskModalReadOnly(readOnly) {
    const form = document.getElementById("task-form");
    if (!form) return;
    form.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.id === "task-id" || el.id === "task-kind") return;
        el.toggleAttribute("disabled", !!readOnly);
    });
    const saveBtn = document.getElementById("task-save-btn");
    if (saveBtn) saveBtn.classList.toggle("hidden", !!readOnly);
}

window.viewTask = function(kind, id) {
    openTaskModal(kind, id);
    setTaskModalReadOnly(true);
    const title = document.getElementById("task-modal-title");
    if (title) title.textContent = "View Item";
};

window.editTask = function(kind, id) {
    openTaskModal(kind, id);
    setTaskModalReadOnly(false);
    const title = document.getElementById("task-modal-title");
    if (title) title.textContent = `Edit ${titleCase(kind)}`;
};

window.deleteTask = function(kind, id) {
    if (!confirm("Delete this item?")) return;
    const listName = `${kind}s`;
    appState[listName] = (appState[listName] || []).filter(i => i.id !== id);
    persist();
    renderPortal();
    toast(`${titleCase(kind)} deleted.`);
};

window.toggleTaskCompletion = function(kind, id, completed) {
    var list = appState[kind + "s"];
    appState[kind + "s"] = list.map(function(item){ return item.id === id ? Object.assign({}, item, { completed: completed }) : item; });
    persist();
    renderPortal();
    toast(titleCase(kind) + " status updated.");
    // Refresh current view without losing context
    var trList = document.getElementById("view-tests-result-list");
    if (trList && !trList.classList.contains("hidden") && currentTestsClass) {
        showTestsForClass(currentTestsClass);
    }
};

function renderTestsResultClasses() {
    const root = document.getElementById("test-result-classes-grid");
    if (!root) return;
    const classes = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
    root.innerHTML = classes.map(c => `
        <article class="teacher-card interactive-pop" onclick="showTestsForClass('${c}')">
            <strong>Class ${c}</strong>
            <p>View tests and mark students.</p>
        </article>
    `).join("");
}

window.showTestsForClass = function(className) {
    currentTestsClass = className;
    document.getElementById("test-result-class-title").textContent = `Tests for Class ${className}`;
    const root = document.getElementById("tests-result-cards");
    const tests = getVisibleTests().filter(t => t.className === className);
    
    const pending = tests.filter(t => !t.completed);
    const completed = tests.filter(t => !!t.completed);

    var renderRow = function(t) { return `
        <article class="list-card interactive-pop" onclick="openManagedTest('${t.id}')">
            <div class="card-head-row">
                <strong style="cursor:pointer; color:var(--brand);">${t.title}</strong>
                <span class="mini-badge">${t.completed ? '&#9989; Completed' : '&#9203; Pending'}</span>
            </div>
            <p>${t.subject} | ${formatDate(t.date)}</p>
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="event.stopPropagation(); openManagedTest('${t.id}')">View Students</button>
            </div>
        </article>
    `; };

    root.innerHTML = `
        <div class="card-list">
            <p class="panel-hint" style="color:var(--brand)"><strong>Pending Tests</strong></p>
            ${(pending.map(renderRow).join("") || `<p class="panel-hint">No pending tests.</p>`)}
            <p class="panel-hint" style="margin-top:0.75rem; color:var(--brand)"><strong>Completed Tests</strong></p>
            ${(completed.map(renderRow).join("") || `<p class="panel-hint">No completed tests.</p>`)}
        </div>
    `;
    
    showView("tests-result-list");
};

window.openManagedTest = function(testId) {
    currentManagedTestId = testId;
    renderManagedTestStudents();
    showView("test-manage");
};

function renderManagedTestStudents() {
    const test = appState.tests.find((entry) => entry.id === currentManagedTestId);
    if (!test) return;
    const root = document.getElementById("test-student-list");
    const summary = document.getElementById("test-manage-summary");
    const search = (document.getElementById("test-student-search").value || "").trim().toLowerCase();
    document.getElementById("test-manage-title").textContent = `${test.title} | ${test.subject}`;
    summary.innerHTML = `
        <article class="summary-card"><span>Subject</span><strong>${test.subject}</strong></article>
        <article class="summary-card"><span>Class</span><strong>${test.className}</strong></article>
        <article class="summary-card"><span>Max Marks</span><strong>${test.maxMarks}</strong></article>
        <article class="summary-card"><span>Passing Marks</span><strong>${test.passMarks}</strong></article>
    `;
    const students = appState.users
        .filter((user) => user.role === "Student" && user.class === test.className)
        .filter((user) => [user.name, user.roll, user.admission].join(" ").toLowerCase().includes(search));
    
    const canGrade = canGradeTestResults(test.subject);
    
    root.innerHTML = students.map((student) => {
        const marks = getTestScore(test, student.id);
        const statusText = marks === "Absent" ? "Absent" : (marks !== null ? `${marks}/${test.maxMarks}` : "Not entered");
        return `
            <article class="teacher-card reveal ${canGrade ? 'interactive-pop' : ''}" ${canGrade ? `onclick="openTestStudentMarksModal('${test.id}','${student.id}')"` : ''}>
                <strong>${student.name}</strong>
                <p>Roll: ${student.roll || "-"} | Admission: ${student.admission || "-"}</p>
                <p>Status: ${statusText}</p>
                ${!canGrade ? `<p class="eyebrow" style="margin-top:0.5rem; color:var(--ink-soft)">View Only</p>` : ''}
            </article>
        `;
    }).join("") || `<article class="teacher-card"><strong>No student found</strong><p>Try another search.</p></article>`;
}

function canGradeTestResults(subject) {
    if (currentUser.role === "Operator" || currentUser.role === "Principal") return true;
    if (currentUser.role === "Teacher" && currentUser.subject === subject) return true;
    return false; // Major and Student cannot grade
}

function canCreateExamResults() {
    // Teacher and Major can also create/edit exam results (not test marks)
    return ["Operator", "Principal", "Teacher", "Major"].includes(currentUser.role);
}

window.openTestStudentMarksModal = function(testId, studentId) {
    const test = appState.tests.find(t => t.id === testId);
    const student = appState.users.find(u => u.id === studentId);
    if (!test || !student) return;
    
    document.getElementById("tsm-test-id").value = testId;
    document.getElementById("tsm-student-id").value = studentId;
    document.getElementById("tsm-student-name").value = student.name;
    const current = getTestScore(test, studentId);
    document.getElementById("tsm-marks").value = (current !== null && current !== "Absent") ? current : "";
    
    document.getElementById("test-student-marks-modal").classList.remove("hidden");
};

window.closeTestStudentMarksModal = function() {
    document.getElementById("test-student-marks-modal").classList.add("hidden");
};

function saveTestStudentMarks(event) {
    event.preventDefault();
    var testId = document.getElementById("tsm-test-id").value;
    var studentId = document.getElementById("tsm-student-id").value;
    var marks = document.getElementById("tsm-marks").value;
    var test = appState.tests.find(function(t){ return t.id === testId; });
    var student = appState.users.find(function(u){ return u.id === studentId; });
    updateTestScore(testId, studentId, marks === "" ? null : Number(marks));
    if (test && student && marks !== "") {
        addNotification("marks", "Marks entered: " + student.name + " scored " + marks + "/" + test.maxMarks + " in " + test.subject, test.className, studentId);
    }
    closeTestStudentMarksModal();
    renderManagedTestStudents();
    toast("Marks saved.");
}

function setTestStudentAbsent() {
    var testId = document.getElementById("tsm-test-id").value;
    var studentId = document.getElementById("tsm-student-id").value;
    var test = appState.tests.find(function(t){ return t.id === testId; });
    var student = appState.users.find(function(u){ return u.id === studentId; });
    updateTestScore(testId, studentId, "Absent");
    if (test && student) {
        addNotification("absent", student.name + " marked Absent in " + test.subject + " (" + test.className + ")", test.className, studentId);
    }
    closeTestStudentMarksModal();
    renderManagedTestStudents();
    toast("Student marked absent.");
}

function deleteTestStudentScore() {
    const testId = document.getElementById("tsm-test-id").value;
    const studentId = document.getElementById("tsm-student-id").value;
    updateTestScore(testId, studentId, null);
    closeTestStudentMarksModal();
    renderManagedTestStudents();
    toast("Score deleted.");
}

function updateTestScore(testId, studentId, value) {
    appState.tests = appState.tests.map(t => {
        if (t.id === testId) {
            let scores = t.scores.filter(s => s.studentId !== studentId);
            if (value !== null) {
                scores.push({ studentId, marks: value });
            }
            return { ...t, scores };
        }
        return t;
    });
    persist();
}

function renderExamResultClasses() {
    const root = document.getElementById("exam-result-classes-grid");
    if (!root) return;
    const classes = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
    root.innerHTML = classes.map(c => `
        <article class="teacher-card interactive-pop" onclick="showExamStudentsForClass('${c}')">
            <strong>Class ${c}</strong>
            <p>View student exam results.</p>
        </article>
    `).join("");
}

window.showExamStudentsForClass = function(className) {
    currentExamClass = className;
    document.getElementById("exam-result-class-title").textContent = `Students in Class ${className}`;
    const root = document.getElementById("exam-result-students-grid");
    const students = appState.users.filter(u => u.role === "Student" && u.class === className);
    
    root.innerHTML = students.map(s => `
        <article class="teacher-card interactive-pop" onclick="showExamResultsForStudent('${s.id}')">
            <strong>${s.name}</strong>
            <p>Roll: ${s.roll || "-"} | Admission: ${s.admission || "-"}</p>
            <div class="action-buttons">
                <button class="action-btn edit-btn">View Results</button>
            </div>
        </article>
    `).join("") || `<p class="panel-hint">No students found in this class.</p>`;
    
    showView("exam-result-students");
};

window.showExamResultsForStudent = function(studentId) {
    const student = appState.users.find(u => u.id === studentId);
    if (!student) return;
    document.getElementById("exam-student-title").textContent = `Exam Results: ${student.name}`;
    document.getElementById("back-to-exam-students").classList.remove("hidden");
    
    // override the render logic specifically for this student
    const prevRender = renderResults;
    window.currentViewedStudentId = studentId;
    renderResults();
    showView("results");
};

function renderResults() {
    const mode = document.getElementById("results-mode").value;
    let records = [];
    
    if (currentUser.role === "Student") {
        records = appState.results.filter(r => r.studentId === currentUser.id && r.term === selectedTerm);
        document.getElementById("back-to-exam-students").classList.add("hidden");
    } else {
        const sid = window.currentViewedStudentId;
        if (sid) {
            records = appState.results.filter(r => r.studentId === sid && r.term === selectedTerm);
        } else {
            records = appState.results.filter(r => r.term === selectedTerm);
        }
    }

    const body = document.getElementById("results-body");
    const chartRoot = document.getElementById("results-chart");

    if (!records.length) {
        body.innerHTML = `<tr><td colspan="4">No result data available for this term.</td></tr>`;
        chartRoot.innerHTML = `<div class="empty-chart">No data to display.</div>`;
        document.getElementById("overall-percentage").textContent = "0%";
        document.getElementById("overall-subject-count").textContent = "0";
        return;
    }

    body.innerHTML = records.map((r) => {
        const percentage = Math.round((r.score / r.max) * 100);
        return `<tr><td>${r.subject}</td><td>${r.score}</td><td>${r.max}</td><td>${percentage}%</td></tr>`;
    }).join("");

    const totalScore = records.reduce((sum, r) => sum + Number(r.score || 0), 0);
    const totalMax = records.reduce((sum, r) => sum + Number(r.max || 0), 0);
    document.getElementById("overall-percentage").textContent = totalMax ? `${Math.round((totalScore / totalMax) * 100)}%` : "0%";
    document.getElementById("overall-subject-count").textContent = records.length;

    if (mode === "table") {
        chartRoot.innerHTML = `<div class="empty-chart">Table view active.</div>`;
    } else if (mode === "pie") {
        chartRoot.innerHTML = renderPieChart(records);
    } else {
        chartRoot.innerHTML = renderBarChart(records);
    }
}

function renderBarChart(records) {
    return `<div class="bar-chart">${records.map((r) => {
        const percentage = Math.round((r.score / r.max) * 100);
        return `<div class="bar-row"><span>${r.subject}</span><div class="bar-track"><div class="bar-fill" style="width:${percentage}%"></div></div><strong>${percentage}%</strong></div>`;
    }).join("")}</div>`;
}

function renderPieChart(records) {
    const values = records.map((r) => Math.max(1, Math.round((r.score / r.max) * 100)));
    const total = values.reduce((sum, v) => sum + v, 0);
    let start = 0;
    const colors = ["#143f8f", "#d9a404", "#3aa0ff", "#1d7f53", "#c05727", "#7d4fff"];
    const slices = values.map((v, i) => {
        const portion = v / total;
        const end = start + portion;
        const path = describeArc(80, 80, 68, start * 360, end * 360);
        start = end;
        return `<path d="${path}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="28"></path>`;
    }).join("");

    return `<div class="pie-layout"><svg viewBox="0 0 160 160" class="pie-chart">${slices}</svg><div class="detail-stack">${records.map((r, i) => `<article class="detail-item"><strong style="color:${colors[i % colors.length]}">${r.subject}</strong><span>${Math.round((r.score / r.max) * 100)}%</span></article>`).join("")}</div></div>`;
}

function renderSyllabus() {
    const root = document.getElementById("syllabus-list");
    const items = currentUser.role === "Student" ? appState.syllabus.filter((item) => item.className === currentUser.class) : appState.syllabus;
    root.innerHTML = items.map((item) => `
        <article class="syllabus-card reveal interactive-pop">
            <div class="card-head-row">
                <strong>${item.subject}</strong>
                <span class="mini-badge">${item.className}</span>
            </div>
            <div class="syllabus-body">
                ${item.type === "file" ? `<p><span class="icon">Ã°Å¸â€œâ€ž</span> ${item.fileName || "Document"}</p>` : `<p>${item.content.replace(/<[^>]*>/g, '').substring(0, 60)}...</p>`}
            </div>
            <div class="action-buttons">
                <button class="action-btn edit-btn" type="button" onclick="viewSyllabus('${item.id}')">View</button>
                ${canEditSyllabus() ? `
                    <button class="action-btn edit-btn" type="button" onclick="openSyllabusModal('${item.id}')">Edit</button>
                    <button class="action-btn delete-btn" type="button" onclick="deleteSyllabus('${item.id}')">Delete</button>
                ` : ""}
            </div>
        </article>
    `).join("") || `<p class="panel-hint">No syllabus records found.</p>`;
}

window.openSyllabusModal = function(itemId = "") {
    const item = itemId ? appState.syllabus.find((entry) => entry.id === itemId) : null;
    document.getElementById("syllabus-modal-title").textContent = item ? "Edit Syllabus" : "Add Syllabus";
    document.getElementById("syllabus-id").value = item?.id || "";
    document.getElementById("syllabus-subject").value = item?.subject || "";
    document.getElementById("syllabus-class").value = item?.className || "";
    document.getElementById("syllabus-type").value = item?.type || "text";
    document.getElementById("syllabus-editor").innerHTML = item?.content || "";
    document.getElementById("current-file-name").textContent = item?.fileName ? `Current file: ${item.fileName}` : "";
    document.getElementById("syllabus-file").value = "";
    currentSyllabusUpload = item?.fileData ? { fileName: item.fileName, fileData: item.fileData } : null;
    syncSyllabusMode();
    document.getElementById("syllabus-modal").classList.remove("hidden");
};

function saveSyllabusRecord(event) {
    event.preventDefault();
    const id = document.getElementById("syllabus-id").value;
    const type = document.getElementById("syllabus-type").value;
    const payload = {
        id: id || `s${Date.now()}`,
        subject: document.getElementById("syllabus-subject").value,
        className: document.getElementById("syllabus-class").value,
        type: type,
        content: type === "text" ? document.getElementById("syllabus-editor").innerHTML : "",
        fileName: type === "file" && currentSyllabusUpload ? currentSyllabusUpload.fileName : "",
        fileData: type === "file" && currentSyllabusUpload ? currentSyllabusUpload.fileData : ""
    };
    if (id) {
        appState.syllabus = appState.syllabus.map(s => s.id === id ? payload : s);
    } else {
        appState.syllabus.push(payload);
    }
    persist();
    closeSyllabusModal();
    renderPortal();
    toast("Syllabus updated.");
}

window.deleteSyllabus = function(id) {
    if(!confirm("Delete this syllabus?")) return;
    appState.syllabus = appState.syllabus.filter(s => s.id !== id);
    persist();
    renderPortal();
    toast("Syllabus deleted.");
}

function handleSyllabusFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentSyllabusUpload = { fileName: file.name, fileData: reader.result };
        document.getElementById("current-file-name").textContent = `Selected file: ${file.name}`;
    };
    reader.readAsDataURL(file);
}

window.viewSyllabus = function(itemId) {
    const item = appState.syllabus.find((entry) => entry.id === itemId);
    if (!item) return;
    document.getElementById("syllabus-viewer-title").textContent = `${item.subject} | ${item.className}`;
    document.getElementById("syllabus-viewer-body").innerHTML = item.type === "file"
        ? `<article class="detail-item"><strong>${item.fileName || "Uploaded file"}</strong><span>Read or download the attached file below.</span></article>`
        : `<article class="detail-item syllabus-view-content">${item.content}</article>`;
    const link = document.getElementById("syllabus-download-link");
    if (item.type === "file" && item.fileData) {
        link.href = item.fileData;
        link.download = item.fileName || "syllabus-file";
        link.classList.remove("hidden");
        link.textContent = "Download File";
    } else {
        link.classList.add("hidden");
    }
    document.getElementById("syllabus-viewer").classList.remove("hidden");
};

function renderMajorAccess() {
    const root = document.getElementById("major-body");
    const hint = document.getElementById("major-hint");
    const search = (document.getElementById("major-search").value || "").trim().toLowerCase();
    
    if (!currentUser || (currentUser.role !== "Operator" && currentUser.role !== "Principal")) {
        root.innerHTML = `<tr><td colspan="5">Only Operator and Principal have User Management Access.</td></tr>`;
        hint.textContent = "Your role does not have user management permission.";
        return;
    }

    hint.textContent = ACCESS_MAP[currentUser.role][1];
    const rows = appState.users.filter((user) => canManageUser(currentUser, user)).filter((user) => [user.name, user.role, user.class, user.subject, user.phone, user.email].filter(Boolean).some((value) => value.toLowerCase().includes(search)));
    root.innerHTML = rows.map((user) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td>${user.subject || user.class || "-"}</td>
            <td>${user.phone || "-"}<br>${user.email || "-"}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" type="button" onclick="openUserModal('${user.id}')">Edit</button>
                    ${canDeleteUser(currentUser, user) ? `<button class="action-btn delete-btn" type="button" data-delete-id="${user.id}" onclick="deleteUser('${user.id}')">Delete</button>` : ""}
                </div>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="5">No editable records found.</td></tr>`;
}

function openUserModal(userId = "") {
    const user = userId ? appState.users.find(u => u.id === userId) : null;
    document.getElementById("modal-title").textContent = user ? "Edit User" : "Add User";
    document.getElementById("modal-id").value = user?.id || "";
    document.getElementById("modal-name").value = user?.name || "";
    document.getElementById("modal-role").value = user?.role || "Student";
    document.getElementById("modal-username").value = user?.username || "";
    document.getElementById("modal-password").value = user?.password || "";
    document.getElementById("modal-roll").value = user?.roll || "";
    document.getElementById("modal-admission").value = user?.admission || "";
    document.getElementById("modal-class").value = user?.class || "";
    document.getElementById("modal-subject").value = user?.subject || "";
    document.getElementById("modal-blood").value = user?.blood || "";
    document.getElementById("modal-phone").value = user?.phone || "";
    document.getElementById("modal-email").value = user?.email || "";
    document.getElementById("modal-status").value = user?.status || "Active";
    document.getElementById("modal-backdrop").classList.remove("hidden");
}

function saveUserRecord(event) {
    event.preventDefault();
    var id = document.getElementById("modal-id").value;
    var payload = {
        id: id || "u" + Date.now(),
        name: document.getElementById("modal-name").value,
        role: document.getElementById("modal-role").value,
        username: document.getElementById("modal-username").value,
        password: document.getElementById("modal-password").value,
        roll: document.getElementById("modal-roll").value,
        admission: document.getElementById("modal-admission").value,
        class: document.getElementById("modal-class").value,
        subject: document.getElementById("modal-subject").value,
        blood: document.getElementById("modal-blood").value,
        phone: document.getElementById("modal-phone").value,
        email: document.getElementById("modal-email").value,
        status: document.getElementById("modal-status").value
    };
    if (id) {
        appState.users = appState.users.map(function(u){ return u.id === id ? payload : u; });
    } else {
        appState.users.push(payload);
    }
    persist();
    closeUserModal();
    renderMajorAccess(); // stay on Major Access, don't switch away
    toast("User saved.");
}

window.deleteUser = function(id) {
    var btn = document.querySelector('[data-delete-id="' + id + '"]');
    if (btn && btn.dataset.confirming !== "1") {
        btn.dataset.confirming = "1";
        var orig = btn.textContent;
        btn.textContent = "Tap again to confirm";
        btn.style.background = "#c0392b";
        setTimeout(function() {
            if (btn) { btn.dataset.confirming = "0"; btn.textContent = orig; btn.style.background = ""; }
        }, 3000);
        return;
    }
    appState.users = appState.users.filter(function(u){ return u.id !== id; });
    persist();
    renderMajorAccess();
    toast("User deleted.");
}

function getTeacherClasses(teacher) {
    // Support multi-class: teacher.classes is an array, or fallback to teacher.class
    if (Array.isArray(teacher.classes) && teacher.classes.length) return teacher.classes;
    if (teacher.class) return [teacher.class];
    return [];
}

function getVisibleTests() {
    var items = appState.tests || [];
    if (!currentUser) return items;
    if (currentUser.role === "Operator" || currentUser.role === "Principal" || currentUser.role === "Major") return items;
    if (currentUser.role === "Student") return items.filter(function(item){ return item.className === currentUser.class; });
    if (currentUser.role === "Teacher") {
        var myClasses = getTeacherClasses(currentUser);
        return items.filter(function(item){
            return item.subject === currentUser.subject || item.createdBy === currentUser.id || myClasses.includes(item.className);
        });
    }
    return items;
}

function getVisibleHomework() {
    var filterDate = (document.getElementById("homework-date-filter") || {}).value || "";
    var items = appState.homework || [];
    if (!currentUser) return items;
    // Operator & Principal see ALL classes homework
    if (currentUser.role === "Operator" || currentUser.role === "Principal" || currentUser.role === "Major") {
        return filterDate ? items.filter(function(i){ return i.date === filterDate; }) : items;
    }
    if (currentUser.role === "Student") {
        items = items.filter(function(item){ return item.className === currentUser.class; });
    } else if (currentUser.role === "Teacher") {
        var myClasses = getTeacherClasses(currentUser);
        items = items.filter(function(item){
            return item.subject === currentUser.subject || item.createdBy === currentUser.id || myClasses.includes(item.className);
        });
    }
    return filterDate ? items.filter(function(i){ return i.date === filterDate; }) : items;
}

function getVisibleResults() {
    const items = appState.results || [];
    if (!currentUser) return items.filter(r => r.term === selectedTerm);
    if (currentUser.role === "Operator" || currentUser.role === "Principal" || currentUser.role === "Major") return items.filter(r => r.term === selectedTerm);
    if (currentUser.role === "Student") return items.filter(r => r.studentId === currentUser.id && r.term === selectedTerm);
    if (currentUser.role === "Teacher") return items.filter(r => r.term === selectedTerm && r.subject === currentUser.subject);
    return items.filter(r => r.term === selectedTerm);
}

function canViewAllSubjects() {
    return ["Operator", "Principal", "Major"].includes(currentUser.role);
}

function canManageUser(actor, target) {
    if (actor.role === "Operator") return actor.id !== target.id;
    if (actor.role === "Principal") return target.role !== "Operator" && target.role !== "Principal" && actor.id !== target.id;
    return false;
}

function canDeleteUser(actor, target) {
    if (actor.role === "Operator") return actor.id !== target.id;
    if (actor.role === "Principal") return target.role === "Student" || target.role === "Teacher";
    return false;
}

// ── Persist: save to localStorage + cloud ─────────────────────────────────────
function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    // Save to cloud (non-blocking)
    if (_syncing) return;
    _syncing = true;
    fetch(API_BASE + "/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: appState, sha: _cloudSha })
    }).then(function(r){ return r.json(); })
      .then(function(j){ if (j.sha) _cloudSha = j.sha; })
      .catch(function(){})
      .finally(function(){ _syncing = false; });
}

// ── Cloud load: fetch from API, merge if newer ─────────────────────────────────
function loadFromCloud(callback) {
    fetch(API_BASE + "/api/load")
        .then(function(r){ return r.json(); })
        .then(function(j) {
            if (j && j.data) {
                _cloudSha = j.sha;
                appState = j.data;
                // ensure shape is up to date
                syncDataShape();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
            }
            if (callback) callback();
        })
        .catch(function() {
            // API not reachable - use local data
            if (callback) callback();
        });
}

// ── Poll for changes every 30s ─────────────────────────────────────────────────
function startCloudPolling() {
    if (_pollInterval) return;
    _pollInterval = setInterval(function() {
        if (!currentUser) return; // only poll when logged in
        fetch(API_BASE + "/api/load")
            .then(function(r){ return r.json(); })
            .then(function(j) {
                if (j && j.sha && j.sha !== _cloudSha) {
                    _cloudSha = j.sha;
                    appState = j.data;
                    syncDataShape();
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
                    renderPortal(); // re-render with fresh data
                    toast("\uD83D\uDD04 Data updated from school server.");
                }
            })
            .catch(function(){});
    }, 30000); // every 30 seconds
}

function toast(msg, isError = false) {
    const root = document.getElementById("toast-root");
    const div = document.createElement("div");
    div.className = `toast ${isError ? "error" : "success"}`;
    div.textContent = msg;
    root.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

function formatDate(dateStr) {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
}

function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
}

function titleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getLabel(key) {
    const lang = appState.settings.language || "en";
    return LANGUAGE_LABELS[lang][key] || key;
}

function applyLanguage() {
    const lang = appState.settings.language || "en";
    document.documentElement.lang = lang;
    document.querySelectorAll(".nav-item[data-view]").forEach(i => {
        i.textContent = getLabel(i.dataset.view);
    });
}

function getTestScore(test, studentId) {
    const score = test.scores.find(s => s.studentId === studentId);
    return score ? score.marks : null;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function applyRevealAnimations() {
    document.querySelectorAll(".reveal:not(.revealed)").forEach(function(el, i) {
        setTimeout(function() { el.classList.add("revealed"); }, i * 40);
    });
}

function renderTermTabs() {
    const root = document.getElementById("term-tabs");
    if (!root) return;
    root.innerHTML = appState.examTypes.map((term) => `<button class="chip-btn ${term === selectedTerm ? "active" : ""}" type="button" onclick="setTerm('${term}')">${term}</button>`).join("");
}

window.setTerm = function(term) {
    selectedTerm = term;
    renderTermTabs();
    renderResults();
};

function populateResultForm() {
    const studentSelect = document.getElementById("result-student");
    const termSelect = document.getElementById("result-term");
    const previewList = document.getElementById("student-preview-list");
    if (studentSelect) studentSelect.innerHTML = appState.users.filter(u => u.role === "Student").map(u => `<option value="${u.id}">${u.name}</option>`).join("");
    if (termSelect) termSelect.innerHTML = appState.examTypes.map(t => `<option value="${t}">${t}</option>`).join("");
    if (previewList) previewList.innerHTML = appState.users.filter(u => u.role === "Student").map(u => `<option value="${u.name}"></option>`).join("");
    populateSubjectOptions();
}

function populateSubjectOptions() {
    const subjects = [...new Set(appState.syllabus.map(s => s.subject).filter(Boolean))];
    const html = subjects.map(s => `<option value="${s}">${s}</option>`).join("");
    const datalist = document.getElementById("subject-options");
    if (datalist) datalist.innerHTML = html;
    // result-subject select removed in favour of dynamic rows — no action needed here
}

function syncResultStudentFromSearch() {
    const typed = document.getElementById("result-student-search").value.trim().toLowerCase();
    const match = appState.users.find(u => u.role === "Student" && u.name.toLowerCase() === typed);
    if (match) {
        document.getElementById("result-student").value = match.id;
        syncResultStudentMeta();
    }
}

function syncResultStudentMeta(preferredSubject) {
    preferredSubject = preferredSubject || "";
    const studentId = document.getElementById("result-student").value;
    const student = appState.users.find(u => u.id === studentId);
    if (!student) return;
    document.getElementById("result-class").value = student.class || "";
    document.getElementById("result-roll").value = student.roll || "";
    // Subject rows are handled by addResultSubjectRow() — no static select to update
}

function closeUserModal() {
    document.getElementById("modal-backdrop").classList.add("hidden");
    document.getElementById("user-form").reset();
}

function closeTaskModal() {
    document.getElementById("task-modal").classList.add("hidden");
    document.getElementById("task-form").reset();
    setTaskModalReadOnly(false);
}

function closeSyllabusModal() {
    document.getElementById("syllabus-modal").classList.add("hidden");
    currentSyllabusUpload = null;
}

function closeResultModal() {
    document.getElementById("result-modal").classList.add("hidden");
    document.getElementById("result-form").reset();
}

function closeViewer() {
    document.getElementById("syllabus-viewer").classList.add("hidden");
}

function closeStudentViewer() {
    document.getElementById("student-viewer").classList.add("hidden");
}

function syncSyllabusMode() {
    const type = document.getElementById("syllabus-type").value;
    document.getElementById("syllabus-editor-wrap").classList.toggle("hidden", type !== "text");
    document.getElementById("syllabus-file-wrap").classList.toggle("hidden", type !== "file");
}

function renderTeacherSearch() {
    const root = document.getElementById("search-results");
    if(!root) return;
    const q = document.getElementById("search-input").value.trim().toLowerCase();
    const matches = appState.users.filter(u => u.role === "Teacher" && [u.name, u.subject, u.class].filter(Boolean).some(v => v.toLowerCase().includes(q)));
    root.innerHTML = matches.map(u => `
        <article class="teacher-card">
            <strong>${u.name}</strong>
            <p>${u.subject} | Class ${u.class}</p>
            <p>${u.phone || '-'} | ${u.email || '-'}</p>
        </article>`).join("") || `<p class="panel-hint">No teachers found.</p>`;
}

function renderStudentsView() {
    var root = document.getElementById("students-list");
    if (!root) return;
    var q = document.getElementById("student-search").value.trim().toLowerCase();
    var students = appState.users.filter(function(u){ return u.role === "Student"; });
    if (currentUser.role === "Teacher") {
        var myClasses = getTeacherClasses(currentUser);
        students = students.filter(function(u){
            return myClasses.includes(u.class) || appState.tests.some(function(t){ return t.createdBy === currentUser.id && t.className === u.class; });
        });
    }
    students = students.filter(function(u){
        return [u.name, u.class, u.roll, u.admission].filter(Boolean).some(function(v){ return v.toLowerCase().includes(q); });
    });
    root.innerHTML = students.map(function(u){
        return '<article class="teacher-card interactive-pop" onclick="openStudentViewer(\'' + u.id + '\')">' +
            '<strong>' + u.name + '</strong>' +
            '<p>Class: ' + u.class + ' | Roll: ' + (u.roll || '-') + '</p>' +
            '<p>Admission: ' + (u.admission || '-') + '</p>' +
            '</article>';
    }).join("") || '<p class="panel-hint">No students found.</p>';
}

window.openStudentViewer = function(id) {
    const student = appState.users.find(u => u.id === id);
    if(!student) return;
    document.getElementById("student-viewer-title").textContent = `Student Detail: ${student.name}`;
    
    const testsBox = document.getElementById("student-tests-box");
    const testScores = appState.tests.filter(t => t.className === student.class).map(t => {
        const score = getTestScore(t, student.id);
        return `<article class="list-card compact-card"><strong>${t.title}</strong><p>${t.subject} | Score: ${score !== null ? score + '/' + t.maxMarks : 'Pending'}</p></article>`;
    });
    testsBox.innerHTML = testScores.join("") || `<p class="panel-hint">No tests available.</p>`;

    const examsBox = document.getElementById("student-exams-box");
    const examScores = appState.results.filter(r => r.studentId === student.id).map(r => `<article class="list-card compact-card"><strong>${r.subject}</strong><p>${r.term} | Score: ${r.score}/${r.max}</p></article>`);
    examsBox.innerHTML = examScores.join("") || `<p class="panel-hint">No exam results available.</p>`;

    document.getElementById("student-viewer").classList.remove("hidden");
}

function openResultModal(id) {
    id = id || "";
    if (!canCreateExamResults()) {
        toast("You do not have permission to create exam results.", true);
        return;
    }
    const r = id ? appState.results.find(function(x){ return x.id === id; }) : null;
    document.getElementById("result-id").value = r ? r.id : "";
    // Reset subject rows
    var rowsContainer = document.getElementById("result-subject-rows");
    if (rowsContainer) rowsContainer.innerHTML = "";
    if (r) {
        document.getElementById("result-student").value = r.studentId;
        syncResultStudentMeta(r.subject);
        document.getElementById("result-term").value = r.term;
        // Single row for edit
        addResultSubjectRow(r.subject, r.score, r.max, r.internal, r.internalMax);
    } else {
        document.getElementById("result-student").selectedIndex = 0;
        syncResultStudentMeta();
        // Default empty row
        addResultSubjectRow();
    }
    document.getElementById("result-modal").classList.remove("hidden");
}

window.addResultSubjectRow = function(subject, score, max, internal, imax) {
    var container = document.getElementById("result-subject-rows");
    if (!container) return;
    var subjects = [];
    // Get subjects for selected student's class
    var studentId = document.getElementById("result-student").value;
    var student = appState.users.find(function(u){ return u.id === studentId; });
    if (student) {
        subjects = appState.syllabus.filter(function(s){ return s.className === student.class; }).map(function(s){ return s.subject; });
    }
    if (!subjects.length) subjects = [...new Set(appState.syllabus.map(function(s){ return s.subject; }))];

    var options = subjects.map(function(s){
        return '<option value="' + s + '"' + (subject === s ? ' selected' : '') + '>' + s + '</option>';
    }).join('');

    var idx = container.children.length;
    var row = document.createElement('div');
    row.className = 'result-subject-row';
    row.style.cssText = 'display:grid;grid-template-columns:1fr 80px 80px 80px 80px auto;gap:0.5rem;align-items:end;margin-bottom:0.75rem;';
    row.innerHTML = '<div class="field" style="margin:0"><label>Subject</label><select class="rs-subject select-input">' + options + '</select></div>' +
        '<div class="field" style="margin:0"><label>Score</label><input type="number" class="rs-score" value="' + (score || '') + '" required></div>' +
        '<div class="field" style="margin:0"><label>Max</label><input type="number" class="rs-max" value="' + (max || 100) + '" required></div>' +
        '<div class="field" style="margin:0"><label>Internal</label><input type="number" class="rs-internal" value="' + (internal || '') + '"></div>' +
        '<div class="field" style="margin:0"><label>Int.Max</label><input type="number" class="rs-imax" value="' + (imax || '') + '"></div>' +
        '<div style="padding-bottom:0.5rem"><button type="button" class="action-btn delete-btn" onclick="this.closest(\'div.result-subject-row\').remove()" style="padding:0.6rem 0.8rem">✕</button></div>';
    container.appendChild(row);
};

function saveResultRecord(event) {
    event.preventDefault();
    if (!canCreateExamResults()) {
        toast("You do not have permission.", true);
        return;
    }
    var id = document.getElementById("result-id").value;
    var studentId = document.getElementById("result-student").value;
    var term = document.getElementById("result-term").value;
    var rows = document.querySelectorAll(".result-subject-row");

    if (rows.length === 0) {
        toast("Please add at least one subject.", true);
        return;
    }

    // If editing a single existing record
    if (id && rows.length === 1) {
        var row = rows[0];
        var payload = {
            id: id,
            studentId: studentId,
            term: term,
            subject: row.querySelector(".rs-subject").value,
            score: Number(row.querySelector(".rs-score").value),
            max: Number(row.querySelector(".rs-max").value),
            internal: Number(row.querySelector(".rs-internal").value || 0),
            internalMax: Number(row.querySelector(".rs-imax").value || 0)
        };
        appState.results = appState.results.map(function(r){ return r.id === id ? payload : r; });
    } else {
        // Multi-subject: add or update each
        rows.forEach(function(row) {
            var subject = row.querySelector(".rs-subject").value;
            var score = Number(row.querySelector(".rs-score").value);
            var max = Number(row.querySelector(".rs-max").value);
            var internal = Number(row.querySelector(".rs-internal").value || 0);
            var internalMax = Number(row.querySelector(".rs-imax").value || 0);
            if (!subject || !max) return;
            var existing = appState.results.find(function(r){
                return r.studentId === studentId && r.term === term && r.subject === subject;
            });
            if (existing) {
                appState.results = appState.results.map(function(r){
                    return (r.studentId === studentId && r.term === term && r.subject === subject)
                        ? { id: r.id, studentId: studentId, term: term, subject: subject, score: score, max: max, internal: internal, internalMax: internalMax }
                        : r;
                });
            } else {
                appState.results.push({
                    id: 'r' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    studentId: studentId, term: term, subject: subject,
                    score: score, max: max, internal: internal, internalMax: internalMax
                });
            }
        });
    }

    persist();
    // Notify the student about their result
    var rStudent = appState.users.find(function(u){ return u.id === studentId; });
    if (rStudent) {
        addNotification("result", "Exam result entered for " + rStudent.name + " - " + term, rStudent.class, studentId);
    }
    closeResultModal();
    renderPortal();
    toast("Result saved.");
}

function openTaskModal(kind, id = "") {
    const list = appState[`${kind}s`];
    const item = id ? list.find(x => x.id === id) : null;
    document.getElementById("task-kind").value = kind;
    document.getElementById("task-modal-title").textContent = item ? `Edit ${titleCase(kind)}` : `Create ${titleCase(kind)}`;
    document.getElementById("task-id").value = item?.id || "";
    document.getElementById("task-title").value = item?.title || "";
    document.getElementById("task-subject").value = item?.subject || currentUser.subject || "";
    document.getElementById("task-class").value = item?.className || currentUser.class || "";
    document.getElementById("task-date").value = item?.date || TODAY;
    document.getElementById("task-desc").value = item?.desc || "";
    
    document.getElementById("homework-expiry-wrap").classList.toggle("hidden", kind !== "homework");
    document.getElementById("task-expire-days").value = item?.autoRemoveDays || 1;
    
    document.getElementById("task-marks-wrap").style.display = kind === "test" ? "flex" : "none";
    if(kind === "test") {
        document.getElementById("task-max").value = item?.maxMarks || 10;
        document.getElementById("task-min").value = item?.minMarks || 0;
        document.getElementById("task-pass").value = item?.passMarks || 4;
    }
    document.getElementById("task-modal").classList.remove("hidden");
}

function saveTaskRecord(e) {
    e.preventDefault();
    const id = document.getElementById("task-id").value;
    const kind = document.getElementById("task-kind").value;
    const autoRemoveDays = Number(document.getElementById("task-expire-days").value) || 1;
    const payload = {
        id: id || `${kind.charAt(0)}${Date.now()}`,
        title: document.getElementById("task-title").value,
        subject: document.getElementById("task-subject").value,
        className: document.getElementById("task-class").value,
        date: document.getElementById("task-date").value,
        desc: document.getElementById("task-desc").value,
        createdBy: currentUser.id,
        autoRemoveDays: autoRemoveDays,
        expiresAt: addDays(document.getElementById("task-date").value, autoRemoveDays)
    };
    if(kind === "test") {
        payload.maxMarks = Number(document.getElementById("task-max").value);
        payload.minMarks = Number(document.getElementById("task-min").value);
        payload.passMarks = Number(document.getElementById("task-pass").value);
        const existing = id ? appState.tests.find(t => t.id === id) : null;
        payload.scores = existing ? existing.scores : [];
        payload.completed = existing ? existing.completed : false;
        if(id) appState.tests = appState.tests.map(t => t.id === id ? payload : t);
        else appState.tests.push(payload);
    } else {
        const existing = id ? appState.homework.find(h => h.id === id) : null;
        payload.completed = existing ? existing.completed : false;
        if(id) appState.homework = appState.homework.map(h => h.id === id ? payload : h);
        else appState.homework.push(payload);
    }
    persist();
    closeTaskModal();
    renderPortal();
    // Notify relevant students/class about new test or homework
    if (!id) {
        var notifType = kind === "test" ? "test" : "homework";
        var notifMsg = (kind === "test" ? "New test: " : "New homework: ") + payload.title + " for class " + payload.className + " (" + payload.subject + ") on " + formatDate(payload.date);
        addNotification(notifType, notifMsg, payload.className, null);
    }
    toast(titleCase(kind) + " saved.");
}

function renderProfile() {
    if(!currentUser) return;
    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-role").value = currentUser.role;
    document.getElementById("profile-roll").value = currentUser.roll || "N/A";
    document.getElementById("profile-admission").value = currentUser.admission || "N/A";
    document.getElementById("profile-class").value = currentUser.class || "";
    document.getElementById("profile-blood").value = currentUser.blood || "";
    document.getElementById("profile-phone").value = currentUser.phone || "";
    document.getElementById("profile-email").value = currentUser.email || "";
    document.getElementById("profile-guardian").value = currentUser.guardian || "";
    document.getElementById("profile-address").value = currentUser.address || "";
    document.getElementById("profile-avatar").textContent = currentUser.name.charAt(0).toUpperCase();
}

function saveProfile(e) {
    e.preventDefault();
    currentUser.class = document.getElementById("profile-class").value;
    currentUser.blood = document.getElementById("profile-blood").value;
    currentUser.phone = document.getElementById("profile-phone").value;
    currentUser.email = document.getElementById("profile-email").value;
    currentUser.guardian = document.getElementById("profile-guardian").value;
    currentUser.address = document.getElementById("profile-address").value;
    appState.users = appState.users.map(u => u.id === currentUser.id ? currentUser : u);
    persist();
    toast("Profile updated successfully.");
}

function renderTimetable() {
    const head = document.getElementById("timetable-head");
    const body = document.getElementById("timetable-body");
    const tt = appState.timetable;
    const isEdit = timetableEditMode;
    
    const editHeaderAttr = isEdit ? 'class="editable-header" contenteditable="true" onblur="updateTTHeader(this)"' : '';
    let headHtml = '<tr><th ' + editHeaderAttr + '>' + tt.headerLabel + '</th>';
    tt.days.forEach(function(d, i) {
        const editDayAttr = isEdit ? 'class="editable-header" contenteditable="true" onblur="updateTTDay(' + i + ', this)"' : '';
        const delBtn = isEdit ? '<button class="mini-delete" onclick="removeCol(' + i + ')">Ã—</button>' : '';
        headHtml += '<th ' + editDayAttr + '>' + d + ' ' + delBtn + '</th>';
    });
    headHtml += '</tr>';
    head.innerHTML = headHtml;
    
    let bodyHtml = '';
    tt.periods.forEach(function(p, pIdx) {
        const editPAttr = isEdit ? 'class="editable-cell" contenteditable="true" onblur="updateTTPeriod(' + pIdx + ', this)"' : '';
        const delRowBtn = isEdit ? '<button class="mini-delete" onclick="removeRow(' + pIdx + ')">Ã—</button>' : '';
        bodyHtml += '<tr><td ' + editPAttr + '>' + p.label + ' ' + delRowBtn + '</td>';
        p.cells.forEach(function(c, cIdx) {
            const editCAttr = isEdit ? 'class="editable-cell" contenteditable="true" onblur="updateTTCell(' + pIdx + ', ' + cIdx + ', this)"' : '';
            bodyHtml += '<td ' + editCAttr + '>' + c + '</td>';
        });
        bodyHtml += '</tr>';
    });
    body.innerHTML = bodyHtml;
}

function toggleTimetableEditMode() {
    timetableEditMode = !timetableEditMode;
    document.getElementById("toggle-edit-mode-btn").textContent = timetableEditMode ? "Exit Edit Mode" : "Edit Mode";
    renderTimetable();
}

function renameTimetableHeader() {
    const newName = prompt("Enter new header label", appState.timetable.headerLabel);
    if(newName) { appState.timetable.headerLabel = newName; renderTimetable(); }
}
function addTimetableDay() {
    appState.timetable.days.push("New Day");
    appState.timetable.periods.forEach(p => p.cells.push(""));
    renderTimetable();
}
function addTimetablePeriod() {
    appState.timetable.periods.push({ label: "New Period", cells: new Array(appState.timetable.days.length).fill("") });
    renderTimetable();
}
window.removeCol = function(idx) {
    if(!confirm("Remove column?")) return;
    appState.timetable.days.splice(idx, 1);
    appState.timetable.periods.forEach(p => p.cells.splice(idx, 1));
    renderTimetable();
}
window.removeRow = function(idx) {
    if(!confirm("Remove row?")) return;
    appState.timetable.periods.splice(idx, 1);
    renderTimetable();
}
window.updateTTHeader = function(el) { appState.timetable.headerLabel = el.textContent; }
window.updateTTDay = function(idx, el) { appState.timetable.days[idx] = el.textContent; }
window.updateTTPeriod = function(idx, el) { appState.timetable.periods[idx].label = el.textContent; }
window.updateTTCell = function(pIdx, cIdx, el) { appState.timetable.periods[pIdx].cells[cIdx] = el.textContent; }
function saveTimetable() { persist(); toast("Timetable saved."); timetableEditMode = false; document.getElementById("toggle-edit-mode-btn").textContent = "Edit Mode"; renderTimetable(); }

function changeLanguage() {
    appState.settings.language = document.getElementById("language-select").value;
    persist();
    applyLanguage();
    renderPortal();
    toast("Language updated.");
}

