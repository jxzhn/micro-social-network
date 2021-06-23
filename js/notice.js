var loading = document.getElementById('loading');  //loading元素
var loadingLock = false;
var loadedTweetList = [];  //当前加载出来的列表（点赞或评论）

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

var noticeType = "like";  //默认进来就是赞
var curNoticeType = noticeType;  //全局变量，可以在同步函数（没有async的函数）中进行修改。

async function initNoticePage(){
    if(noticeType == "like"){
        like_select.classList.add("notice-select-selected");
    }
    else{
        comment_select.classList.add("notice-select-selected");
    }
    loadMoreTweets(10);
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
        loadMoreTweets(10);
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
        loadMoreTweets(10);
    }
    else{
        scrollToTop();
    }
}

//----------------------loading--------------------------
function showTweets(tweetList, currentUserName, currentUserId, start, end) {
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
                            `<span id="tweet-user-name">${currentUserName}</span>\n` +
                            `<span id="tweet-user-id">@${currentUserId}</span>\n` + //???ajax?
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
                            `<span id="tweet-user-name">${currentUserName}</span>\n` +
                            `<span id="tweet-user-id">@${currentUserId}</span>\n` + //???ajax?
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

// async function loadMoreTweets(numTweet) {
//     if (loadingLock) {  //已经在等待就直接返回
//         return;
//     }
//     loadingLock = true;
//     loading.style.display = 'block';
//     // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
//     var tweetList = await new Promise((resolve, reject) => {
//         setTimeout(() => {
//             if(curNoticeType=="like")
//             {
//                 tweetList = [
//                     {
//                         postId: Math.round(Math.random() * 1000000000),
//                         user: {
//                             userName: "一位路过的靓仔",
//                             userId: "handsomeboy",
//                             userImgUrl: "https://avatars.githubusercontent.com/u/84268960?v=4"
//                         },
//                         //date: new Date().toLocaleDateString(),
//                         content: "新买的ThinkPad，刚刚开封，系统自带win10，没有安装其他任何第三方软件。第一个安装的是搜狗输入法，刚装上就发了个弹窗：检测到系统存在9个垃圾软件，建议清理巴拉巴拉。嗯，系统里除了你，我还没有安装任何其他东西呢，你到还是真直觉，这么快就把自己归入垃圾软件了",
//                         imgUrl: "",
//                         postDate: 1624269255,
//                         likeDate: 1624269255
//                     },
//                     {
//                         postId: Math.round(Math.random() * 1000000000),
//                         user: {
//                             userName: "Yes Theory",
//                             userId: "YesTheory",
//                             userImgUrl: "https://avatars.githubusercontent.com/u/84268956?v=4"
//                         },
//                         //date: new Date(new Date - 24*3600*1000).toLocaleDateString(),
//                         content: "Don't wait for the opportunity of an adventure to present itself to you. Go seek it for yourself wherever you are ⚡⚡⚡",
//                         imgUrl: "https://pic2.zhimg.com/50/v2-a8971875ffbcabefe0eb4bc9f478d126_hd.jpg?source=1940ef5c",
//                         postDate: 1624269256,
//                         likeDate: 1624269256
//                     }
//                 ];
//             }
//             else if(curNoticeType=="comment")
//             {
//                 tweetList = [
//                     {
//                         postId: Math.round(Math.random() * 1000000000),
//                         user: {
//                             userName: "一位路过的靓仔",
//                             userId: "handsomeboy",
//                             userImgUrl: "https://avatars.githubusercontent.com/u/84268960?v=4"
//                         },
//                         //date: new Date().toLocaleDateString(),
//                         content: "新买的ThinkPad，刚刚开封，系统自带win10，没有安装其他任何第三方软件。第一个安装的是搜狗输入法，刚装上就发了个弹窗：检测到系统存在9个垃圾软件，建议清理巴拉巴拉。嗯，系统里除了你，我还没有安装任何其他东西呢，你到还是真直觉，这么快就把自己归入垃圾软件了",
//                         imgUrl: "",
//                         commentDate: 1624269255,
//                         postDate: 1624269255,
//                         comment:"确实！新买的ThinkPad，刚刚开封，系统自带win10，没有安装其他任何第三方软件。第一个安装的是搜狗输入法，刚装上就发了个弹窗：检测到系统存在9个垃圾软件，建议清理巴拉巴拉。嗯，系统里除了你，我还没有安装任何其他东西呢，你到还是真直觉，这么快就把自己归入垃圾软件了"
//                     },
//                     {
//                         postId: Math.round(Math.random() * 1000000000),
//                         user: {
//                             userName: "Yes Theory",
//                             userId: "YesTheory",
//                             userImgUrl: "https://avatars.githubusercontent.com/u/84268956?v=4"
//                         },
//                         //date: new Date(new Date - 24*3600*1000).toLocaleDateString(),
//                         content: "Don't wait for the opportunity of an adventure to present itself to you. Go seek it for yourself wherever you are ⚡⚡⚡",
//                         imgUrl: "https://pic2.zhimg.com/50/v2-a8971875ffbcabefe0eb4bc9f478d126_hd.jpg?source=1940ef5c",
//                         commentDate: 1624269256,
//                         postDate: 1624269256,
//                         comment:"确实！新买的ThinkPad，刚刚开封，系统自带win10，没有安装其他任何第三方软件。第一个安装的是搜狗输入法，刚装上就发了个弹窗：检测到系统存在9个垃圾软件，建议清理巴拉巴拉。嗯，系统里除了你，我还没有安装任何其他东西呢，你到还是真直觉，这么快就把自己归入垃圾软件了"
//                     }
//                 ];
//             }
            
//             while (tweetList.length < numTweet) {
//                 tweetList.push(...tweetList);
//             }
//             resolve(tweetList.slice(0, numTweet));
//         }, 1000);
//     });
//     loadedTweetList.push(...tweetList);
//     var currentUser = await currentUserInfoPromise;
//     var userName = currentUser.userName;
//     var userId = currentUser.userId;
    
//     showTweets(tweetList, userName, userId);
//     //showTweets(tweetList);
//     loading.style.display = 'none';
//     loadingLock = false;
// }


async function loadMoreTweets(numTweet) {
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
    if(curNoticeType=="like")
    {
        var count=0;
        loadedTweetList = [];  //初始化
        var info2send={
            timeStamp: Math.round(new Date().getTime()/1000), //这样才是unix时间(10位)
            loadedNum: 0,
            requestNum: 10
        }
        console.log("send to /user/Likes:");
        console.log(info2send);
        likeList = await ajax.post("/user/Likes", info2send).data.posts;
        while(likeList.length!=0)
        {
            loadedTweetList = loadedTweetList.concat(likeList);
            showTweets(loadedTweetList, userName, userId, count, count+likeList.length());
            count += likeList.length();
            info2send.timeStamp = Math.round(new Date().getTime()/1000); //这样才是unix时间(10位)
            info2send.loadedNum = count;
            info2send.requestNum = 10;
            console.log("send to /user/Likes:");
            console.log(info2send);
            likeList = await ajax.post("/user/Likes", info2send).data.posts;
        }
    }
    else if(curNoticeType=="comment")
    {
        var count=0;
        loadedTweetList = [];  //初始化
        var info2send={
            timeStamp: Math.round(new Date().getTime()/1000), //这样才是unix时间(10位)
            loadedNum: 0,
            requestNum: 10
        }
        console.log("send to /user/comment:");
        console.log(info2send);
        commentList = await ajax.post("/user/comment", info2send).data.posts;
        while(commentList.length!=0)
        {
            loadedTweetList = loadedTweetList.concat(commentList);
            showTweets(loadedTweetList, userName, userId, count, count+commentList.length());
            count += commentList.length();
            info2send.timeStamp = Math.round(new Date().getTime()/1000); //这样才是unix时间(10位)
            info2send.loadedNum = count;
            info2send.requestNum = 10;
            console.log("send to /user/comment:");
            console.log(info2send);
            commentList = await ajax.post("/user/comment", info2send).data.posts;
        }
    }
    loading.style.display = 'none';
    loadingLock = false;
}


function goDetail(i) {  //得到原贴的详情（参数是id）
    window.location.href = "/detail.html?id=" + loadedTweetList[i].postId;
}

function goUserProfile(i) {  //得到用户个人主页（参数是id）
    window.location.href = "/profile.html?id=" + loadedTweetList[i].user.userId;
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
        loadMoreTweets(10);
    }
})