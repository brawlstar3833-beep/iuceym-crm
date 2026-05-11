// ── DATA & STATE ────────────────────────────────
const LS = {
  set: (k,v)=>localStorage.setItem(k, JSON.stringify(v)),
  get: (k)=>JSON.parse(localStorage.getItem(k))
};

let users = LS.get('lc89_users') || [
  {id:'u1',login:'admin',pass:'admin123',role:'admin',fname:'Администратор',lname:'Системы',info:'',created:new Date().toLocaleDateString('ru-RU')},
  {id:'u2',login:'teacher',pass:'teacher123',role:'teacher',fname:'Айгүл',lname:'Бекова',info:'',created:new Date().toLocaleDateString('ru-RU')},
  {id:'u3',login:'student',pass:'student123',role:'student',fname:'Алихан',lname:'Турсунов',info:'',created:new Date().toLocaleDateString('ru-RU')}
];

let students = LS.get('lc89_students') || [];
let teachers = LS.get('lc89_teachers') || [];
let parents = LS.get('lc89_parents') || [];
let session = null;
let regRole = 'admin';

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// ── AUTH LOGIC ──────────────────────────────────
function authTab(type, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('auth-login').style.display = (type === 'login') ? 'block' : 'none';
  document.getElementById('auth-register').style.display = (type === 'register') ? 'block' : 'none';
}

function selectAuthRole(role, el) {
  regRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function doLogin() {
  const u = document.getElementById('l-user').value;
  const p = document.getElementById('l-pass').value;
  const err = document.getElementById('login-err');
  
  const found = users.find(x => x.login === u && x.pass === p);
  
  if (found) {
    session = found;
    LS.set('lc89_session', session);
    startApp();
    toast('green', `Добро пожаловать, ${found.fname}!`);
  } else {
    err.textContent = 'Неверный логин или пароль';
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 3000);
  }
}

function doRegister() {
  const login = document.getElementById('r-user').value;
  const pass = document.getElementById('r-pass').value;
  const fname = document.getElementById('r-fname').value;
  const lname = document.getElementById('r-lname').value;
  
  if (!login || !pass || !fname) {
    toast('red', 'Заполните обязательные поля');
    return;
  }
  
  const newUser = {
    id: uid(),
    login,
    pass,
    role: regRole,
    fname,
    lname,
    info: '',
    created: new Date().toLocaleDateString('ru-RU')
  };
  
  users.push(newUser);
  LS.set('lc89_users', users);
  toast('green', 'Аккаунт создан! Теперь войдите.');
  setTimeout(() => { location.reload(); }, 1500);
}

function startApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');
  
  // Установка данных пользователя в сайдбаре
  document.getElementById('user-name').textContent = `${session.fname} ${session.lname[0]}.`;
  document.getElementById('user-av').textContent = session.fname[0];
  
  updateBadges();
  goPage('dashboard', null, '📊 Панель управления');
}

// ── NAVIGATION & PAGES ──────────────────────────
function goPage(pid, el, title) {
  // UI Update
  if (el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }
  
  document.getElementById('topbar-title').textContent = title;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  const targetPage = document.getElementById('p-' + pid);
  if (targetPage) targetPage.classList.add('active');
  
  renderContent(pid);
  if (window.innerWidth <= 992) closeSidebar();
}

function renderContent(pid) {
  const p = document.getElementById('p-' + pid);
  
  if (pid === 'dashboard') {
    p.innerHTML = `
      <div class="card">
        <h2>Салам, ${session.fname}! 👋</h2>
        <p style="color:var(--text2); margin-top:8px">Рады видеть вас в системе управления лицеем.</p>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px">
        <div class="card"><h3>${students.length}</h3><p>Учеников</p></div>
        <div class="card"><h3>${users.length}</h3><p>Пользователей</p></div>
      </div>
    `;
  }
  
  if (pid === 'students') {
    p.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
          <h3>Список студентов</h3>
          <button class="btn btn-primary" onclick="toast('yellow', 'Функция добавления в разработке')">+ Добавить</button>
        </div>
        <div id="students-list">
          ${students.length ? '' : '<p style="color:var(--muted)">Студентов пока нет...</p>'}
        </div>
      </div>
    `;
  }
}

// ── UI HELPERS ──────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

function updateBadges() {
  const nb = document.getElementById('nb-students');
  if (nb) nb.textContent = students.length;
}

function toast(type, msg) {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast`;
  el.style.borderLeft = `4px solid ${type === 'green' ? 'var(--green)' : type === 'red' ? 'var(--red)' : 'var(--yellow)'}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function doLogout() {
  localStorage.removeItem('lc89_session');
  location.reload();
}

// ── INIT ────────────────────────────────────────
window.onload = () => {
  const saved = LS.get('lc89_session');
  if (saved && saved.id) {
    session = saved;
    startApp();
  }
};
