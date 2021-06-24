var sideUser = document.getElementById('side-user');
var sideUserMenu = document.getElementById('side-user-menu');

function hideSideUserMenu() {
    sideUserMenu.style.display = 'none';
    sideUser.removeAttribute('no-hover-bg');
    document.removeEventListener('click', checkSideUserMenu);
}

function checkSideUserMenu(e) {
    if (!e.target.getAttribute('in-side-user-menu')) {
        console.log(e.target);
        hideSideUserMenu();
    }
}

function showSideUserMenu() {
    sideUserMenu.style.display = '';
    sideUser.setAttribute('no-hover-bg', '');
    setTimeout(() => {
        document.addEventListener('click', checkSideUserMenu);
    }, 0);
}

async function logOut() {
    // await ajax.post('/user/logout', {});
    window.location.href = '/login.html';
}