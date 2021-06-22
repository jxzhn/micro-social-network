var loading = document.getElementById('loading');
var loadingLock = false;
var tweet;
var loadedCommentList = [];

function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable){ return pair[1];} 
    }
    return false;
}

var id = getQueryVariable('id');

Date.prototype.Format = function(fmt) {
    var o = {   
        "M+" : this.getMonth()+1,                 //月份   
        "d+" : this.getDate(),                    //日   
        "h+" : this.getHours(),                   //小时   
        "m+" : this.getMinutes(),                 //分   
        "s+" : this.getSeconds(),                 //秒   
        "q+" : Math.floor((this.getMonth()+3)/3), //季度   
        "S"  : this.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
        if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
}


async function loadDetail(numTweet) {
    console.log(id);
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    tweet = await new Promise((resolve, reject) => {
        setTimeout(() => {
            tweet = {
                user: {
                    userName: "一位路过的靓仔",
                    userId: "handsomeboy",
                    userImgUrl: "https://avatars.githubusercontent.com/u/84268960?v=4"
                },
                date: new Date().toLocaleDateString(),
                content: "新买的ThinkPad，刚刚开封，系统自带win10，没有安装其他任何第三方软件。第一个安装的是搜狗输入法，刚装上就发了个弹窗：检测到系统存在9个垃圾软件，建议清理巴拉巴拉。嗯，系统里除了你，我还没有安装任何其他东西呢，你到还是真直觉，这么快就把自己归入垃圾软件了",
                imgUrl: "",
                numComment: 8,
                liked: false,
                numLike: 20,
            }
            resolve(tweet);
        }, 1000);
    });
    showTweetDetail();
}

var tweetCommentBox;
var tweetCommentTextarea;
var tweetComentLen;
var tweetSendCommentButton;

function showTweetDetail() {
    var block = document.createElement('div');
    block.classList.add('tweet-detail-block');
    
    block.innerHTML =
    `<div class="tweet-detail-user-row" onclick="goUserProfile()">\n` + 
        `<img class="tweet-detail-user-img" src="${tweet.user.userImgUrl}">\n` +
        `<div class="tweet-detail-info-row">\n` + 
            `<span class="tweet-detail-user-name">${tweet.user.userName}</span><br />\n` + 
            `<span class="tweet-detail-user-id">@${tweet.user.userId}</span>\n` + 
        `</div>\n` + 
    `</div>\n` + 
    `<div class="tweet-detail-content">\n` + 
        `<span>${tweet.content}</span>\n` + 
        `<div class="tweet-detail-content-img" style="display: ${tweet.imgUrl?'block':'none'}; background-image: url(${tweet.imgUrl})"></div>\n` + 
    `</div>\n` + 
    `<div class="tweet-detail-date-row">\n` + 
        `<span class="tweet-detail-date">${new Date(tweet.date).Format('hh:dd')}</span>\n` + 
        `<span class="tweet-detail-dot">.</span>\n` + 
        `<span class="tweet-detail-date">${new Date(tweet.date).Format('yyyy 年 MM 月 dd 日')}</span>\n` + 
    `</div>\n` +
    `<div class="tweet-detail-interact-row">\n` + 
        `<span class="tweet-detail-comment" onclick="showCommentBox()"><i class="far fa-comment"></i>${tweet.numComment}</span>\n` + 
        `<span class="tweet-detail-like ${tweet.liked?'tweet-detail-liked':''}" onclick="clickLike(this)"><i class="${tweet.liked?'fas':'far'} fa-heart"></i>${tweet.numLike}</span>\n` + 
    `</div>\n` +
    `<div id="tweet-comment-box" class="cool-input-box">\n` + 
        `<textarea id="tweet-comment-textarea" required></textarea>\n` + 
        `<label for="test-textarea">评论</label>\n` +
        `<span id="tweet-comment-len">0/140</span>` +
        `<button id="tweet-send-comment-button" class="solid-button" onclick="sendComment()" disabled>发布</button>\n` + 
    `</div>\n`

    loading.parentNode.insertBefore(block, loading);

    tweetCommentBox = document.getElementById('tweet-comment-box');
    tweetCommentTextarea = document.getElementById('tweet-comment-textarea');
    tweetComentLen = document.getElementById('tweet-comment-len');
    tweetSendCommentButton = document.getElementById('tweet-send-comment-button');

    tweetCommentTextarea.addEventListener('keypress', (e) => {
        // 13 - 回车
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    });
    
    tweetCommentTextarea.addEventListener('keyup', (e) => {
        var content = tweetCommentTextarea.value;
        tweetComentLen.textContent = `${content.length}/140`;
    
        if (!content.length || content.length > 140) {
            tweetComentLen.style.color = 'var(--red)';
            tweetSendCommentButton.disabled = true;
        } else {
            tweetComentLen.style.color = 'var(--gray)';
            tweetSendCommentButton.disabled = false;
        }
    });
    

    loadMoreComments(8);
}

async function loadMoreComments(numComment) {
    if (loadingLock) {
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    commentList = await new Promise((resolve, reject) => {
        setTimeout(() => {
            commentList = [
                {
                    commentId: Math.round(Math.random() * 1000000000),
                    user: {
                        userName: "一位路过的靓仔",
                        userId: "handsomeboy",
                        userImgUrl: "https://avatars.githubusercontent.com/u/84268960?v=4"
                    },
                    date: new Date().toLocaleDateString(),
                    content: "哈哈哈写的真好！哈哈哈写的真好！哈哈哈写的真好！哈哈哈写的真好！哈哈哈写的真好！哈哈哈写的真好！",
                },
                {
                    commentId: Math.round(Math.random() * 1000000000),
                    user: {
                        userName: "Yes Theory",
                        userId: "YesTheory",
                        userImgUrl: "https://avatars.githubusercontent.com/u/84268956?v=4"
                    },
                    date: new Date(new Date - 24*3600*1000).toLocaleDateString(),
                    content: "good ⚡⚡⚡",
                }
            ];
            while (commentList.length < numComment) {
                commentList.push(...commentList);
            }
            resolve(commentList.slice(0, numComment));
        }, 1000);
    });
    loadedCommentList.push(...commentList);
    showComments(commentList);
    loading.style.display = 'none';
    loadingLock = false;
}

function showComments(commentList) {
    for (i in commentList) {
        var comment = commentList[i];

        var block = document.createElement('div');
        block.classList.add('tweet-block');
        
        block.innerHTML =
        `<img class="tweet-user-img" onclick="goUserProfile(${i})" src="${comment.user.userImgUrl}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-info-row">\n` + 
                `<span class="tweet-user-name" onclick="goUserProfile(${i})">${comment.user.userName}</span>\n` + 
                `<span class="tweet-user-id" onclick="goUserProfile(${i})">@${comment.user.userId}</span>\n` + 
                `<span class="tweet-dot">.</span>\n` + 
                `<span class="tweet-date">${new Date(comment.date).Format('MM 月 dd 日')}</span>\n` + 
            `</div>\n` + 
            `<div class="tweet-content">\n` + 
                `<span>${comment.content}</span>\n` + 
            `</div>\n` + 
        `</div>`

        loading.parentNode.insertBefore(block, loading);
    }
}

function clickLike(likeElement) {
    // 发送 AJAX

    tweet.liked = !tweet.liked;
    likeElement.classList = `tweet-detail-like ${tweet.liked?'tweet-detail-liked':''}`;
    likeElement.childNodes[0].classList = `${tweet.liked?'fas':'far'} fa-heart`;
}

function goUserProfile(i) {
    if (!i) {
        window.location.href = "/profile.html?id=" + tweet.user.userId;
    }
    window.location.href = "/profile.html?id=" + loadedCommentList[i].user.userId;
}

function sendComment() {
    var content = tweetCommentTextarea.value;

    console.log(content);

    // 重置
    tweetCommentTextarea.value = '';
    tweetComentLen.textContent = '0/140';
    tweetComentLen.style.color = 'var(--red)';
    tweetSendCommentButton.disabled = true;
    tweetCommentBox.style.display = 'none';
}

window.addEventListener('scroll', () => {
    // 变量scrollTop是滚动条滚动时，离顶部的距离
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    // 变量windowHeight是可视区的高度
    var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    // 变量scrollHeight是滚动条的总高度
    var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    // 判断滚动条是否到底部
    if(scrollTop + windowHeight >= scrollHeight - 10){
        //写后台加载数据的函数
        loadMoreComments(8);
    }
})


loadDetail();

function showCommentBox() {
    tweetCommentBox.style.display = tweetCommentBox.style.display == 'block'?'none':'block';
}