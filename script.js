const LS = {
  set: (k,v)=>localStorage.setItem(k, JSON.stringify(v)),
  get: (k)=>JSON.parse(localStorage.getItem(k))
};

let users = LS.get('lc89_users') || [
  {id:'u1',login:'admin',pass:'admin123',role:'admin',fname:'Администратор',lname:'Системы'}
];
let students = LS.get('lc89_students') || [];
let teachers = LS.get('lc89_teachers') || [];
let parents = LS.get('lc89_parents') || [];
let session = null;
let regRole = 'admin';

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Функция для лоадера
function showLoader(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="mysql-loader">
            <div class="spinner"></div>
            <p style="margin-top:15px; color:var(--accent); font-family:'Unbounded'; font-size:10px">СИНХРОНИЗАЦИЯ MYSQL...</p>
        </div>`;
}

function authTab(type, el) {
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('auth-login').style.display = type==='login'?'block':'none';
  document.getElementById('auth-register').style.display = type==='register'?'block':'none';
}

function selectAuthRole(role, el) {
  regRole = role;
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}

function doLogin() {
  const u = document.getElementById('l-user').value;
  const p = document.getElementById('l-pass').value;
  const found = users.find(x => x.login === u && x.pass === p);
  if(found) {
    session = found;
    LS.set('lc89_session', session);
    startApp();
  } else {
    const err = document.getElementById('login-err');
    err.textContent = 'Ошибка доступа';
    err.style.display = 'block';
  }
}

function doRegister() {
  const login = document.getElementById('r-user').value;
  const pass = document.getElementById('r-pass').value;
  const fname = document.getElementById('r-fname').value;
  const lname = document.getElementById('r-lname').value;
  if(!login || !pass) return alert('Заполните данные');
  
  const newUser = { id: uid(), login, pass, role: regRole, fname, lname };
  users.push(newUser);
  LS.set('lc89_users', users);
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
    {id:'dashboard', i:'📊', t:'Дашборд'},
    {id:'students', i:'🎓', t:'Студенты'},
    {id:'teachers', i:'👩‍🏫', t:'Учителя'}
  ];
  nav.innerHTML = menu.map(m => `
    <div class="nav-item" id="nav-${m.id}" onclick="goPage('${m.id}')">
      <span>${m.i}</span><span>${m.t}</span>
    </div>
  `).join('');
}

function goPage(pid) {
  const content = document.getElementById('main-content');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(document.getElementById('nav-'+pid)) document.getElementById('nav-'+pid).classList.add('active');

  // Показываем лоадер перед отрисовкой
  showLoader('main-content');

  setTimeout(() => {
      if(pid === 'dashboard') {
        content.innerHTML = `<div class="card"><h2>Привет, ${session.fname}!</h2><p>Система готова к работе.</p></div>`;
      } else if(pid === 'students') {
        content.innerHTML = `
          <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px">
                <h3>Студенты</h3>
                <button class="btn btn-primary" onclick="openModal('add-student')">+ Добавить</button>
            </div>
            <div style="display:grid; gap:10px">
                ${students.length ? students.map(s => `<div>${s.name} (${s.group})</div>`).join('') : 'Нет данных'}
            </div>
          </div>`;
      }
  }, 500); // Небольшая задержка для вида лоадера
}

function openModal(id){ document.getElementById('ov-'+id).classList.add('show'); }
function closeModal(id){ document.getElementById('ov-'+id).classList.remove('show'); }

function saveStudent() {
  const name = document.getElementById('as-name').value;
  const group = document.getElementById('as-group').value;
  if(!name) return;
  students.push({ id: uid(), name, group });
  LS.set('lc89_students', students);
  closeModal('add-student');
  goPage('students');
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('show'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('show'); }
function doLogout() { localStorage.removeItem('lc89_session'); location.reload(); }

window.onload = () => {
  const saved = LS.get('lc89_session');
  if(saved) { session = saved; startApp(); }
};
