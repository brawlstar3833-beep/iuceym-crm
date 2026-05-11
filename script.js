// --- ХРАНИЛИЩЕ И СОСТОЯНИЕ ---
const LS = {
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  get: (k) => JSON.parse(localStorage.getItem(k))
};

let users = LS.get('lc89_users') || [
  {id:'u1',login:'admin',pass:'admin123',role:'admin',fname:'Администратор',lname:'Системы'},
  {id:'u2',login:'teacher',pass:'teacher123',role:'teacher',fname:'Айгүл',lname:'Бекова'},
  {id:'u3',login:'student',pass:'student123',role:'student',fname:'Алихан',lname:'Турсунов'}
];
let students = LS.get('lc89_students') || [];
let teachers = LS.get('lc89_teachers') || [];
let parents = LS.get('lc89_parents') || [];
let session = null;
let regRole = 'admin';

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// --- ИНТЕРФЕЙСНЫЕ ФУНКЦИИ ---
function authTab(type, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('auth-login').style.display = type === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = type === 'register' ? 'block' : 'none';
}

function selectAuthRole(role, el) {
  regRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// --- ФУНКЦИЯ ЛОАДЕРА ---
function renderLoader() {
  return `
    <div class="db-loader-container">
      <div class="mysql-spinner"></div>
      <div class="loader-msg">ЗАГРУЗКА ИЗ MYSQL...</div>
    </div>`;
}

// --- АВТОРИЗАЦИЯ ---
function doLogin() {
  const u = document.getElementById('l-user').value;
  const p = document.getElementById('l-pass').value;
  const err = document.getElementById('login-err');
  
  const found = users.find(x => x.login === u && x.pass === p);
  if(found) {
    session = found;
    LS.set('lc89_session', session);
    startApp();
  } else {
    err.textContent = 'Ошибка: Неверный логин или пароль';
    err.style.display = 'block';
  }
}

function doRegister() {
  const login = document.getElementById('r-user').value;
  const pass = document.getElementById('r-pass').value;
  const fname = document.getElementById('r-fname').value;
  const lname = document.getElementById('r-lname').value;
  
  if(!login || !pass || !fname) return alert('Заполните все поля!');
  
  const newUser = { id: uid(), login, pass, role: regRole, fname, lname };
  users.push(newUser);
  LS.set('lc89_users', users);
  toast('success', 'Регистрация успешна!');
  setTimeout(() => location.reload(), 1000);
}

function startApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appContainer').classList.remove('hidden');
  renderNav();
  goPage('dashboard');
}

// --- НАВИГАЦИЯ И СТРАНИЦЫ ---
function renderNav() {
  const nav = document.getElementById('main-nav');
  const menu = [
    {id:'dashboard', i:'📊', t:'Дашборд'},
    {id:'students', i:'🎓', t:'Студенты'},
    {id:'teachers', i:'👩‍🏫', t:'Учителя'},
    {id:'groups', i:'📁', t:'Группы'}
  ];
  nav.innerHTML = menu.map(m => `
    <div class="nav-item" id="nav-${m.id}" onclick="goPage('${m.id}')">
      <span class="nav-icon">${m.i}</span><span>${m.t}</span>
    </div>
  `).join('');
}

function goPage(pid) {
  const content = document.getElementById('main-content');
  const title = document.getElementById('topbar-title');
  
  // Активация пункта меню
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + pid);
  if(activeNav) activeNav.classList.add('active');

  // Показываем лоадер перед отрисовкой
  content.innerHTML = renderLoader();
  
  // Имитируем запрос к MySQL
  setTimeout(() => {
    if(pid === 'dashboard') {
      title.textContent = 'Панель управления';
      content.innerHTML = `
        <div class="card">
          <h2>Привет, ${session.fname}!</h2>
          <p>Сегодня ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
          <div class="card"><h3>${students.length}</h3><p>Учеников</p></div>
          <div class="card"><h3>${teachers.length}</h3><p>Учителей</p></div>
        </div>
      `;
    } else if(pid === 'students') {
      title.textContent = 'Список студентов';
      content.innerHTML = `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center">
             <h3>База учеников</h3>
             <button class="btn btn-primary" onclick="openModal('add-student')">+ Добавить</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ФИО</th><th>Группа</th><th>Действие</th></tr></thead>
              <tbody>
                ${students.length ? students.map(s => `<tr><td>${s.name}</td><td>${s.group}</td><td><button onclick="delStudent('${s.id}')">🗑️</button></td></tr>`).join('') : '<tr><td colspan="3">Студентов пока нет</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    closeSidebar();
  }, 600);
}

// --- УПРАВЛЕНИЕ ДАННЫМИ ---
function openModal(id){ document.getElementById('ov-'+id).classList.add('show'); }
function closeModal(id){ document.getElementById('ov-'+id).classList.remove('show'); }

function saveStudent() {
  const name = document.getElementById('as-name').value;
  const group = document.getElementById('as-group').value;
  if(!name) return alert('Введите имя!');
  
  students.push({ id: uid(), name, group });
  LS.set('lc89_students', students);
  closeModal('add-student');
  goPage('students');
  toast('success', 'Ученик добавлен');
}

function delStudent(id) {
  students = students.filter(s => s.id !== id);
  LS.set('lc89_students', students);
  goPage('students');
}

function toast(type, msg) {
  const wrap = document.getElementById('toasts');
  const el = document.createElement('div');
  el.style = "background:#fff; padding:15px 25px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1); margin-bottom:10px; border-left:5px solid " + (type==='success'?'#059669':'#dc2626');
  el.innerHTML = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function doLogout() {
  localStorage.removeItem('lc89_session');
  location.reload();
}

// Инициализация сессии
window.onload = () => {
  const saved = LS.get('lc89_session');
  if(saved) {
    session = saved;
    startApp();
  }
};
