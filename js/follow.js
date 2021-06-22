var loading = document.getElementById('loading');
var loadingLock = false;
var loadedTweetList = [];

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

var usedId =  getQueryVariable('id');
var followType = getQueryVariable('followType');
var curFollowType = followType;
//--------------------------init page-------------------------
var following_select = document.getElementById("following-select");
var followed_select = document.getElementById("followed-select");

async function initFollowPage(){
    if(followType == "following"){
        following_select.classList.add("follow-select-selected");
    }
    else{
        followed_select.classList.add("follow-select-selected");
    }
}
initFollowPage();

//----------------------page function--------------------------
function selectFollowing(){
    if(curFollowType == "followed"){
        following_select.classList.add("follow-select-selected");
        followed_select.classList.remove("follow-select-selected");
        curFollowType = "following";
    }
    //TODO: update user blocks
}
function selectFollowed(){
    if(curFollowType == "following"){
        following_select.classList.remove("follow-select-selected");
        followed_select.classList.add("follow-select-selected");
        curFollowType = "followed";
    }
     //TODO: update user blocks
}
//----------------------follow button related--------------------------
function follow(obj){
    console.log(obj.parentNode);
    obj.parentNode.innerHTML = `<button id="cancelFollowBtn" class="solid-button" onclick="cancelFollow(this);">取消关注</button>\n`;
}
function cancelFollow(obj){
    console.log(obj.parentNode);
    obj.parentNode.innerHTML = `<button id="followBtn" class="solid-button" onclick="follow(this);">关注</button>\n`;
}
//----------------------loading--------------------------
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

function showTweets(tweetList) {
    for (i in tweetList) {
        var tweet = tweetList[i];
        var block = document.createElement('div');
        block.classList.add('tweet-block');
        block.innerHTML =
        `<img onclick="goUserProfile(${i})" class="tweet-user-img" src="${tweet.user.userImgUrl}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-leftInfo">\n` + 
                `<div class="tweet-info-row">\n` + 
                    `<span class="tweet-user-name" onclick="goUserProfile(${i})">${tweet.user.userName}</span><br>\n` + 
                    `<span class="tweet-user-id" onclick="goUserProfile(${i})">@${tweet.user.userId}</span>\n` + 
                `</div>\n` + 
                `<div class="tweet-content" onclick="goDetail(${i})">\n` + 
                    `<span>${tweet.content.length > 30 ? tweet.content.substring(0 ,30) + '...' : tweet.content}</span>\n` + 
                `</div>\n` +
            `</div>\n` + 
            `<div class="tweet-followBtns">\n` + 
                `<button id="followBtn" class="solid-button" onclick="follow(this);">关注</button>\n` + 
                // `<button id="cancelFollowBtn" class="solid-button" onclick="cancelFollow(this);">取消关注</button>\n` + 
            `</div>\n` + 
        `</div>`
        loading.parentNode.insertBefore(block, loading);
    }
}

async function loadMoreTweets(numTweet) {
    if (loadingLock) {
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    var tweetList = await new Promise((resolve, reject) => {
        setTimeout(() => {
            tweetList = [
                {
                    id: Math.round(Math.random() * 1000000000),
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
                    numLike: 20 
                },
                {
                    id: Math.round(Math.random() * 1000000000),
                    user: {
                        userName: "Yes Theory",
                        userId: "YesTheory",
                        userImgUrl: "https://avatars.githubusercontent.com/u/84268956?v=4"
                    },
                    date: new Date(new Date - 24*3600*1000).toLocaleDateString(),
                    content: "Don't wait for the opportunity of an adventure to present itself to you. Go seek it for yourself wherever you are ⚡⚡⚡",
                    imgUrl: "https://pic2.zhimg.com/50/v2-a8971875ffbcabefe0eb4bc9f478d126_hd.jpg?source=1940ef5c",
                    numComment: 20,
                    liked: true,
                    numLike: 143
                }
            ];
            while (tweetList.length < numTweet) {
                tweetList.push(...tweetList);
            }
            resolve(tweetList.slice(0, numTweet));
        }, 1000);
    });
    loadedTweetList.push(...tweetList);
    showTweets(tweetList);
    loading.style.display = 'none';
    loadingLock = false;
}

function clickLike(likeElement, i) {
    console.log(i);
    var tweet = loadedTweetList[i];

    // 发送 AJAX

    tweet.liked = !tweet.liked;
    likeElement.classList = `tweet-like ${tweet.liked?'tweet-liked':''}`;
    likeElement.childNodes[0].classList = `${tweet.liked?'fas':'far'} fa-heart`;
}

function goDetail(i) {
    window.location.href = "/detail.html?id=" + loadedTweetList[i].id;
}

function goUserProfile(i) {
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
        loadMoreTweets(5);
    }
})

loadMoreTweets(10);