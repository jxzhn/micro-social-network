var sendTweetEditor = document.getElementById('send-tweet-editor');
var sendTweetLen = document.getElementById('send-tweet-len');
var sendTweetButton = document.getElementById('send-tweet-button');

sendTweetEditor.addEventListener('keypress', (e) => {
    // 13 - 回车
    if (e.keyCode == 13) {
        e.preventDefault();
        return false;
    }
});

sendTweetEditor.addEventListener('keyup', (e) => {
    var content = sendTweetEditor.textContent;
    sendTweetLen.textContent = `${content.length}/140`;

    if (!content.length || content.length > 140) {
        sendTweetLen.style.color = 'var(--red)';
        sendTweetButton.disabled = true;
    } else {
        sendTweetLen.style.color = 'var(--gray)';
        sendTweetButton.disabled = false;
    }
});

var sendTweetImg = document.getElementById('send-tweet-img');
var sendTweetImgFile = document.getElementById('send-tweet-img-file');

var imgDataURL;

function clickAddPhoto() {
    sendTweetImgFile.click();
}

function handlePhoto(files) {
    var imageType = /^image\//;
    if (!files.length || !imageType.test(files[0].type)) {
        imgDataURL = undefined;
        sendTweetImg.style.display = 'none';
        sendTweetImg.style.backgroundImage = 'none';
        return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
        imgDataURL = e.target.result;
        sendTweetImg.style.display = 'block';
        sendTweetImg.style.backgroundImage = `url(${imgDataURL})`;
    }
    reader.readAsDataURL(files[0]);
}

function sendTweet() {
    var content = sendTweetEditor.textContent;

    var data = {
        content: content,
        img: imgDataURL || ''
    }

    // 利用 AJAX 上传
    console.log(data);

    hidePopup('send-tweet-popup');
    sendTweetEditor.textContent = '';
    sendTweetLen.textContent = '0/140';
    sendTweetLen.style.color = 'var(--red)';
    sendTweetButton.disabled = true;
    imgDataURL = '';
    sendTweetImg.style.display = 'none';
}