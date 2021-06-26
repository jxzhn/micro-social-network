var loading = document.getElementById('loading');  //loading元素
var loadingLock = false;
var loadedTweetList = [];  //当前加载出来的列表（点赞或评论）
var loadedCount = 0;

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

//--------------------------init page-------------------------
var like_select = document.getElementById("like-select");
var comment_select = document.getElementById("comment-select");

// var noticeType = "like";  //默认进来就是赞
var curNoticeType = "like";  //全局变量（默认进来就是赞），可以在同步函数（没有async的函数）中进行修改。
var currentUserId = "";
var currentUserName = "";

async function initNoticePage(){
    if(curNoticeType == "like"){
        like_select.classList.add("notice-select-selected");
    }
    else{
        comment_select.classList.add("notice-select-selected");
    }
    loadMoreTweets(10, true);
}
initNoticePage();


//----------------------page function--------------------------
const scrollToTop = () => {
    const fromTopDistance = document.documentElement.scrollTop || document.body.scrollTop;
    if (fromTopDistance > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, fromTopDistance - fromTopDistance/ 8);
    }
}

function selectLike(){
    if(curNoticeType == "comment"){  //从comment切换
        like_select.classList.add("notice-select-selected");  //class中添加这个属性
        comment_select.classList.remove("notice-select-selected");
        curNoticeType = "like";
        loading.parentNode.innerHTML = `<div id="loading">\n`+
           `<span><i class="fas fa-circle-notch fa-spin"></i>正在加载...</span>\n`+
       `</div>\n`;  //恢复这个loading
        loading = document.getElementById('loading');
        loadMoreTweets(10, false);
    }
    else{
        scrollToTop();
    }
}

function selectComment(){
    if(curNoticeType == "like"){
        like_select.classList.remove("notice-select-selected");
        comment_select.classList.add("notice-select-selected");
        curNoticeType = "comment";    
        loading.parentNode.innerHTML = `<div id="loading">\n`+
           `<span><i class="fas fa-circle-notch fa-spin"></i>正在加载...</span>\n`+
        `</div>\n`;
        loading = document.getElementById('loading');
        //console.log(curNoticeType);
        loadMoreTweets(10, false);
    }
    else{
        scrollToTop();
    }
}



//----------------------loading--------------------------
var LOAD_FLAG = true;
function showTweets(tweetList, currentUserName, currentUserId, start, end) {
    //currentUserId = userId;
    //currentUserName = userName;
    if(curNoticeType=="like"){
        for (var i=start; i<end; i++) {
            var like = tweetList[i];
            var block = document.createElement('div');
            block.classList.add('like-block');
            block.innerHTML = 
            `<img onclick="goUserProfile(${i})" class="like-user-img" src="${like.user.userImgUrl}">\n` + 
            `<div class="like-detail">\n` +
                `<div class="like-user-detail">\n` + 
                    `<span id="like-user-name" onclick="goUserProfile(${i})">${like.user.userName}</span>\n` +
                    `<span id="like-user-id" onclick="goUserProfile(${i})">@${like.user.userId}</span>\n` +
                    `<span id="like-dot">.</span>\n` +
                    `<span id="like-date">${new Date(like.likeDate*1000).Format('MM 月 dd 日')}</span><br />\n` + //likeDate是unixtime，需要乘1000
                    `<span id="like-info" onclick="goDetail(${i})">点赞了这条微博</span>\n` +
                `</div>\n`+
                `<div class="like-content">\n` +
                    `<img class="tweet-content-img-like" onclick="goDetail(${i})" src="${like.imgUrl}" style="display: ${like.imgUrl? 'flex':'none'}">\n` + 
                    `<div class="tweet-detail">\n` +
                        `<div class="tweet-info-row">\n` + 
                            `<span id="tweet-user-name" onclick="goUserProfile()">${currentUserName}</span>\n` +
                            `<span id="tweet-user-id" onclick="goUserProfile()">@${currentUserId}</span>\n` + //???ajax?
                            `<span id="tweet-dot">.</span>\n` +
                            `<span id="tweet-date">${new Date(like.postDate*1000).Format('MM 月 dd 日')}</span>\n`+ 
                        `</div>\n` +
                        `<div class="tweet-content" onclick="goDetail(${i})">\n` +
                            `${like.content}\n` +
                        `</div>\n` +
                    `</div>\n` +
                `</div>\n` +
            `</div>`;
            loading.parentNode.insertBefore(block, loading);  //在loading元素的parantNode中，loading的前面加入block
        }
    }
    else if(curNoticeType=="comment")
    {
        for (i in tweetList) {
            var comment = tweetList[i];
            var block = document.createElement('div');
            block.classList.add('comment-block');
            block.innerHTML = 
            `<img onclick="goUserProfile(${i})" class="comment-user-img" src="${comment.user.userImgUrl}">\n` + 
            `<div class="comment-detail">\n` +
                `<div class="comment-user-detail">\n` + 
                    `<span id="comment-user-name" onclick="goUserProfile(${i})">${comment.user.userName}</span>\n` +
                    `<span id="comment-user-id" onclick="goUserProfile(${i})">@${comment.user.userId}</span>\n` +
                    `<span id="comment-dot">.</span>\n` +
                    `<span id="comment-date">${new Date(comment.commentDate*1000).Format('MM 月 dd 日')}</span><br />\n` + //likeDate是unixtime，需要乘1000
                    `<span id="comment-info-notice" onclick="goDetail(${i})">${comment.comment}</span>\n` +
                `</div>\n`+
                `<div class="comment-content">\n` +
                    `<img class="tweet-content-img-like" onclick="goDetail(${i})" src="${comment.imgUrl}" style="display: ${comment.imgUrl? 'flex':'none'}">\n` + 
                    `<div class="tweet-detail">\n` +
                        `<div class="tweet-info-row">\n` + 
                            `<span id="tweet-user-name" onclick="goUserProfile()">${currentUserName}</span>\n` +
                            `<span id="tweet-user-id" onclick="goUserProfile()">@${currentUserId}</span>\n` + //???ajax?
                            `<span id="tweet-dot">.</span>\n` +
                            `<span id="tweet-date">${new Date(comment.postDate*1000).Format('MM 月 dd 日')}</span>\n`+ 
                        `</div>\n` +
                        `<div class="tweet-content" onclick="goDetail(${i})">\n` +
                            `${comment.content}\n` +
                        `</div>\n` +
                    `</div>\n` +
                `</div>\n` +
            `</div>`;
            loading.parentNode.insertBefore(block, loading);  //在loading元素的parantNode中，loading的前面加入block
        }
    } 
}


async function loadMoreTweets(numTweet, is_same_noticeType) {
    
    if (loadingLock) {  //已经在等待就直接返回
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    //获得当前用户的userName和userId
    var currentUser = await currentUserInfoPromise;
    var userName = currentUser.userName;
    var userId = currentUser.userId;

    // 向AJAX服务器请求数据
    if(is_same_noticeType==true) //当时向下scroll之后再加载数据
    {
        var info2send={
            timeStamp: Math.round(new Date().getTime()/1000), //这样才是unix时间(10位)
            loadedNum: loadedCount,
            requestNum: numTweet
        }
        url = "/notice/"+ curNoticeType;
        console.log("send to "+url);
        console.log(info2send);
        noticeList = (await ajax.post(url, info2send)).posts;  //返回的已经是data了
        if(noticeList.length!=0){
            loadedTweetList = loadedTweetList.concat(noticeList);
            showTweets(loadedTweetList, userName, userId, loadedCount, loadedCount+noticeList.length);
            loadedCount += noticeList.length;
        }
    }
    else  //当时切换noticeType来加载数据，要清空loadedCount和loadedTweetList
    {
        //console.log("hhhhhh");
        loadedCount = 0;
        loadedTweetList = [];
        var info2send={
            timeStamp: Math.round(new Date().getTime()/1000), //这样才是unix时间(10位)
            loadedNum: loadedCount,
            requestNum: numTweet
        }
        url = "/notice/"+ curNoticeType;
        console.log("send to "+url);
        console.log(info2send);
        noticeList = (await ajax.post(url, info2send)).posts; //返回的已经是data了
        if(noticeList.length!=0){
            loadedTweetList = loadedTweetList.concat(noticeList);
            showTweets(loadedTweetList, userName, userId, loadedCount, loadedCount+noticeList.length);
            loadedCount += noticeList.length;
        }
        if(noticeList.length < numTweet)
        {
            LOAD_FLAG=false;//加上这个变量，当取得数小于numtweet，表示将数据库取尽，此时可不再loading。
        }
    }
    loading.style.display = 'none';
    loadingLock = false;
}


function goDetail(i) {  //得到原贴的详情（参数是postId）
    window.location.href = "/detail.html?postId=" + loadedTweetList[i].postId;
}

function goUserProfile(i) {  //得到用户个人主页（参数是id）
    if(!i){     //如果i为空，即参数为空，则表示是登录用户本人
        window.location.href = "/profile.html?id=" + currentUserId;
    }
    else{       //否则，表示评论、点赞用户
        window.location.href = "/profile.html?id=" + loadedTweetList[i].user.userId;
    }
    
}

window.addEventListener('scroll', () => {
    //当到底一次之后，怎么删除这个listener，使得不会再加载？会自动删除吗？
    // 变量scrollTop是滚动条滚动时，离顶部的距离
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    // 变量windowHeight是可视区的高度
    var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
    // 变量scrollHeight是滚动条的总高度
    var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    // 判断滚动条是否到底部
    if(scrollTop + windowHeight >= scrollHeight - 10){
        //写后台加载数据的函数
        if(LOAD_FLAG){
            loadMoreTweets(10, true);
        }
    }
})