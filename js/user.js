var userName;
var userId;
var userImgUrl;

var sideUserImg = document.getElementById('side-user-img');
var sideUserName = document.getElementById('side-user-name');
var sideUserId = document.getElementById('side-user-id');

// AJAX 检查登录状态，获取以下参数
userName = 'Jason Kan';
userId = 'peachoolon9';
userImgUrl = 'https://avatars.githubusercontent.com/u/84268956?v=4';

sideUserImg.src = userImgUrl;
sideUserName.textContent = userName;
sideUserId.textContent = userId;

function getUserInfo() {
    return {
        userName: userName,
        userId: userId,
        userImgUrl: userImgUrl
    }
}