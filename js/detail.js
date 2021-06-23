var loading = document.getElementById('loading');
var loadingLock = false;
var tweet;
var loadedCommentList = [];
var loadedCommentNum = 0;

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

var id = getQueryVariable('id');  //postId

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
    // 用 AJAX 向服务器请求 numTweet 条数据
    console.log("send to jsp/post/detail");
    var info2send={
        postId: id
    }
    console.log(info2send);
    tweet = await ajax.post("jsp/post/detail", info2send);
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
        `<span class="tweet-detail-date">${new Date(tweet.date*1000).Format('hh:mm')}</span>\n` + 
        `<span class="tweet-detail-dot">.</span>\n` + 
        `<span class="tweet-detail-date">${new Date(tweet.date*1000).Format('yyyy 年 MM 月 dd 日')}</span>\n` + 
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
    loadedCommentNum = 0;  //初始化评论数为0，然后再加载。
    loadedCommentList = [];  //初始化列表为空
    loadMoreComments(8);
}

async function loadMoreComments(numComment) {
    if (loadingLock) {
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    // 用 AJAX 向服务器请求 numTweet 条数据
    console.log("send to jsp/post/getComment");
    info2send = {
        postId: id,
        timeStamp: Math.round(new Date().getTime()/1000), //这样才是unix时间(10位)
        loadedNum: loadedCommentNum,
        requestNum: numComment
    };
    console.log(info2send);
    commentList = (await ajax.post("jsp/post/getComment", info2send)).commentList;//得到返回的commentList
    loadedCommentList = loadedCommentList.concat(commentList);
    showComments(loadedCommentList, loadedCommentNum, loadedCommentNum+commentList.length());
    loadedCommentNum += commentList.length; //？可以修改
    loading.style.display = 'none';
    loadingLock = false;
}

function showComments(commentList, start, end) {
    for (var i=start; i<end; i++) {
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
                `<span class="tweet-date">${new Date(comment.date*1000).Format('MM 月 dd 日')}</span>\n` + 
            `</div>\n` + 
            `<div class="tweet-content">\n` + 
                `<span>${comment.content}</span>\n` + 
            `</div>\n` + 
        `</div>`

        loading.parentNode.insertBefore(block, loading);
    }
}

async function clickLike(likeElement) {
    // // 发送给AJAX服务器
    var info2send = {
        postId: id
    };
    var url = tweet.liked?"jsp/post/like":"jsp/post/dislike";
    console.log("send to "+url);
    console.log(info2send);
    _  = await ajax.post(url, info2send);
    // 更改点赞数字
    tweet.numLike = tweet.liked ? tweet.numLike-1: tweet.numLike+1;     //这甚至不用改！因为这不是改显示！
    likeElement.childNodes[1].nodeValue = tweet.numLike;    //通过childNodes[1]获取到文本节点，在通过修改nodeValue修改节点包含的文本！
    // 更改样式
    tweet.liked = !tweet.liked;
    likeElement.classList = `tweet-detail-like ${tweet.liked?'tweet-detail-liked':''}`;
    likeElement.childNodes[0].classList = `${tweet.liked?'fas':'far'} fa-heart`;
}

function goUserProfile(i) {
    if (!i) {
        window.location.href = "/profile.html?id=" + tweet.user.userId;
    }
    else{
        window.location.href = "/profile.html?id=" + loadedCommentList[i].user.userId;
    }
    
}

async function sendComment() {
    var content = tweetCommentTextarea.value;
    console.log(content);
    // 向ajax服务器发送评论
    console.log('send to jsp/post/comment');
    var info2send = {
        postId: id,
        content: content
    };
    console.log(info2send);
    _ = await ajax.post("jsp/post/comment", info2send);
    //新增评论数并更新
    tweet.numComment += 1;
    var commentElement = document.getElementsByClassName("tweet-detail-comment")[0];//找到显示数字的那个元素（和引起这个sendComment事件的元素不同）
    commentElement.childNodes[1].nodeValue = tweet.numComment;
    //获得当前用户的userName和userId
    var currentUser = await currentUserInfoPromise;
    var userName = currentUser.userName;
    var userId = currentUser.userId;
    var userAvatar = currentUser.userImgUrl;
    var curTime = Math.round(new Date().getTime()/1000);
    //显示新评论
    var block = document.createElement('div');
    block.classList.add('tweet-block');
    block.innerHTML =
        `<img class="tweet-user-img" onclick="goUserProfile()" src="${userAvatar}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-info-row">\n` + 
                `<span class="tweet-user-name" onclick="goUserProfile()">${userName}</span>\n` + 
                `<span class="tweet-user-id" onclick="goUserProfile()">@${userId}</span>\n` + 
                `<span class="tweet-dot">.</span>\n` + 
                `<span class="tweet-date">${new Date(curTime*1000).Format('MM 月 dd 日')}</span>\n` + 
            `</div>\n` + 
            `<div class="tweet-content">\n` + 
                `<span>${content}</span>\n` + 
            `</div>\n` + 
        `</div>`;
    var tweet_detail_block = document.getElementsByClassName("tweet-detail-block")[0];
    var parent = tweet_detail_block.parentNode;
    if(parent.lastChild == loading){   //当没有评论时，直接加在帖子后面
        parent.appendChild(block);
    }
    else{  //否则，将最新评论加在评论区第一条
        parent.insertBefore(block, tweet_detail_block.nextSibling);
    }

    // 重置评论框
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

function showCommentBox() { // 评论框的显示和折叠
    tweetCommentBox.style.display = tweetCommentBox.style.display == 'block'?'none':'block';
}