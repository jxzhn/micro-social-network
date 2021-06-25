// AJAX 检查登录状态
async function loadCurrentUserInfo() {
    // 假数据
    /*var currentUserInfo = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                userName: 'Yes Theory',
                userId: 'YesTheory',
                userImgUrl: 'https://avatars.githubusercontent.com/u/84268956?v=4',
            })
        }, 500);
    });*/
    var currentUserInfo = await ajax.post('/user/currentUserInfo', {})
    var sideUser = document.getElementById('side-user');
    if (sideUser) {
        document.getElementById('side-user-img').src = currentUserInfo.userImgUrl;
        document.getElementById('side-user-name').textContent = currentUserInfo.userName;
        document.getElementById('side-user-id').textContent = currentUserInfo.userId;
        sideUser.style.opacity = '';
    }
    var sendTweetButton = document.querySelector('#send-blog>button');
    if (sendTweetButton) {
        sendTweetButton.disabled = false;
    }
    var sendTweetUserImg = document.getElementById('send-tweet-user-img');
    if (sendTweetUserImg) {
        sendTweetUserImg.src = currentUserInfo.userImgUrl;
    }

    return currentUserInfo;
}

const currentUserInfoPromise = loadCurrentUserInfo();
