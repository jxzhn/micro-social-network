var loading = document.getElementById('loading');
var loadingLock = false;
var loadedTweetList = [];
var currentIdx = 0;
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
        `<img onclick="goUserProfile(${currentIdx})" class="tweet-user-img" src="${tweet.user.userImgUrl}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-info-row">\n` + 
                `<span class="tweet-user-name" onclick="goUserProfile(${currentIdx})">${tweet.user.userName}</span>\n` + 
                `<span class="tweet-user-id" onclick="goUserProfile(${currentIdx})">@${tweet.user.userId}</span>\n` + 
                `<span class="tweet-dot">.</span>\n` + 
                `<span class="tweet-date">${new Date(tweet.date*1000).Format('MM 月 dd 日')}</span>\n` + 
            `</div>\n` + 
            `<div class="tweet-content" onclick="goDetail(${currentIdx})">\n` + 
                `<span>${tweet.content}</span>\n` + 
                `<div class="tweet-content-img" style="display: ${tweet.imgUrl?'block':'none'}; background-image: url(${tweet.imgUrl})"></div>\n` + 
            `</div>\n` + 
            `<div class="tweet-interact-row">\n` + 
                `<span class="tweet-comment" onclick="goDetail(${currentIdx})"><i class="far fa-comment"></i>${tweet.numComment}</span>\n` + 
                `<span class="tweet-like ${tweet.liked?'tweet-liked':''}" onclick="clickLike(this, ${currentIdx});"><i class="${tweet.liked?'fas':'far'} fa-heart"></i>${tweet.numLike}</span>\n` + 
            `</div>\n` + 
        `</div>`
        currentIdx += 1;
        loading.parentNode.insertBefore(block, loading);
    }
}
var LOAD_FLAG = true;
async function loadMoreTweets(numTweet) {
    if (loadingLock) {
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    var tweetList = [];
    try{
        var infoToSend = {
            timeStamp: Math.round(new Date().getTime() / 1000),
            loadedNum: loadedTweetList.length,
            requestNum: numTweet
        }
        console.log("send to /post/list/follow:");
        console.log(infoToSend);
        tweetList = (await ajax.post("/post/list/follow", infoToSend)).posts;
    }
    catch(err){
        console.log(err);
    }

    if(tweetList.length < numTweet){
        LOAD_FLAG = false;
    }
    loadedTweetList.push(...tweetList);
    showTweets(tweetList);
    loading.style.display = 'none';
    loadingLock = false;
}


async function clickLike(likeElement, i) {
    var tweet = loadedTweetList[i];
    var likeInfo = {
        postId: loadedTweetList[i].postId
    }
    if(tweet.liked){
        try{
            console.log("send to /post/dislike:");
            console.log(likeInfo);
            await ajax.post("/post/dislike", likeInfo);
            likeElement.lastChild.nodeValue = parseInt(likeElement.lastChild.nodeValue) - 1;
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        try{
            console.log("send to /post/like:");
            console.log(likeInfo);
            await ajax.post("/post/like", likeInfo);
            likeElement.lastChild.nodeValue = parseInt(likeElement.lastChild.nodeValue) + 1;
        }
        catch(err){
            console.log(err);
        }
    }
    tweet.liked = !tweet.liked;
    likeElement.classList = `tweet-like ${tweet.liked?'tweet-liked':''}`;
    likeElement.childNodes[0].classList = `${tweet.liked?'fas':'far'} fa-heart`;
}

function goDetail(i) {
    window.location.href = "./detail.html?postId=" + loadedTweetList[i].postId;
}

function goUserProfile(i) {
    window.location.href = "./profile.html?id=" + loadedTweetList[i].user.userId;
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
        if(LOAD_FLAG)loadMoreTweets(5);
    }
})

loadMoreTweets(10);



const scrollToTop = () => {
    const fromTopDistance = document.documentElement.scrollTop || document.body.scrollTop;
    if (fromTopDistance > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, fromTopDistance - fromTopDistance/ 8);
    }
}