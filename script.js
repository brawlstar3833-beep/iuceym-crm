// --- DATABASE / STATE ---
const LS = {
  set: (k,v)=>localStorage.setItem(k, JSON.stringify(v)),
  get: (k)=>JSON.parse(localStorage.getItem(k))
};

let users = LS.get('lc89_users') || [];
let students = LS.get('lc89_students') || [];
let teachers = LS.get('lc89_teachers') || [];
let parents = LS.get('lc89_parents') || [];
let session = null;

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// --- UI HELPERS ---
function showLoader() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="mysql-loader">
            <div class="spinner"></div>
            <p style="margin-top:15px; font-family:'Unbounded'; font-size:12px; color:var(--accent)">
                Синхронизация с MySQL...
            </p>
        </div>`;
}

function authTab(type, el) {
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('auth-login').style.display = type==='login'?'block':'none';
    document.getElementById('auth-register').style.display = type==='register'?'block':'none';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
    document.getElementById('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

// --- AUTH LOGIC ---
function doLogin() {
    const u = document.getElementById('l-user').value;
    const p = document.getElementById('l-pass').value;
    const err = document.getElementById('login-err');
    
    // Дефолтный админ если база пуста
    if(users.length === 0 && u === 'admin' && p === 'admin123') {
        session = {id: 'root', role: 'admin', fname: 'Admin'};
        startApp();
        return;
    }

    const found = users.find(x => x.login === u && x.pass === p);
    if(found) {
        session = found;
        LS.set('lc89_session', session);
        startApp();
    } else {
        err.textContent = 'Неверный логин или пароль';
        err.style.display = 'block';
    }
}

function doRegister() {
    // Упрощенная логика регистрации
    const login = document.getElementById('r-user').value;
    const pass = document.getElementById('r-pass').value;
    if(login.length < 3) return alert('Слишком короткий логин');
    
    const newUser = { id: uid(), login, pass, role: 'student', fname: 'Новый', lname: 'Пользователь' };
    users.push(newUser);
    LS.set('lc89_users', users);
    alert('Регистрация успешна! Теперь войдите.');
    location.reload();
}

function startApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    renderNav();
    goPage('dashboard');
}

function renderNav() {
    const nav = document.getElementById('main-nav');
    const menu = [
        {id:'dashboard', icon:'📊', label:'Дашборд'},
        {id:'students', icon:'🎓', label:'Студенты'},
        {id:'teachers', icon:'👩‍🏫', label:'Преподаватели'}
    ];
    nav.innerHTML = menu.map(m => `
        <div class="nav-item" onclick="goPage('${m.id}')">
            <span class="nav-icon">${m.icon}</span>
            <span>${m.label}</span>
        </div>
    `).join('');
}

function goPage(pageId) {
    showLoader();
    setTimeout(() => {
        const content = document.getElementById('main-content');
        if(pageId === 'dashboard') {
            content.innerHTML = `<h2>Добро пожаловать в CRM</h2><p>Выберите раздел в меню.</p>`;
        } else {
            content.innerHTML = `<h2>Раздел: ${pageId}</h2><p>Данные из MySQL загружены.</p>`;
        }
        closeSidebar();
    }, 800); // Имитация задержки сети
}

function doLogout() {
    localStorage.removeItem('lc89_session');
    location.reload();
}

// Инициализация
window.onload = () => {
    const saved = LS.get('lc89_session');
    if(saved) {
        session = saved;
        startApp();
    }
};
