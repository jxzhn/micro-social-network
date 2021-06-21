var currentUserName;
var currentUserId;
var currentUserImgUrl;

var sideUserImg = document.getElementById('side-user-img');
var sideUserName = document.getElementById('side-user-name');
var sideUserId = document.getElementById('side-user-id');

// AJAX 检查登录状态，获取以下参数
currentUserName = 'Jason Kan';
currentUserId = 'peachoolon9';
currentUserImgUrl = 'https://avatars.githubusercontent.com/u/84268956?v=4';

sideUserImg.src = currentUserImgUrl;
sideUserName.textContent = currentUserName;
sideUserId.textContent = currentUserId;

// function getUserInfo() {
//     return {
//         userName: userName,
//         userId: userId,
//         userImgUrl: userImgUrl
//     }
// }