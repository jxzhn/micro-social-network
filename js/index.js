var mainDiv = document.getElementById('main');
var nowLoadedTweets = 0;

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
    for (tweet of tweetList) {
        var block = document.createElement('div');
        block.classList.add('tweet-block');
        
        block.innerHTML =
        `<img class="tweet-user-img" src="${tweet.user.userImgUrl}">` +
        `<div class="tweet-detail">` + 
            `<div class="tweet-info-row">` + 
                `<span class="tweet-user-name">${tweet.user.userName}</span>` + 
                `<span class="tweet-user-id">@${tweet.user.userId}</span>` + 
                `<span class="tweet-dot">.</span>` + 
                `<span class="tweet-date">${new Date(tweet.date).Format('MM 月 dd 日')}</span>` + 
            `</div>` + 
            `<div class="tweet-content">` + 
                `<span>${tweet.content}</span>` + 
                `<div class="tweet-content-img" style="display: ${tweet.imgUrl?'block':'none'}; background-image: url(${tweet.imgUrl})"></div>` + 
            `</div>` + 
            `<div class="tweet-interact-row">` + 
                `<span class="tweet-comment"><i class="far fa-comment"></i>${tweet.numComment}</span>` + 
                `<span class="tweet-like ${tweet.liked?'tweet-liked':''}"><i class="${tweet.liked?'fas':'far'} fa-heart"></i>${tweet.numLike}</span>` + 
            `</div>` + 
        `</div>`

        mainDiv.appendChild(block);
    }
}

async function getTweets(numTweet) {
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    tweetList = [
        {
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
    nowLoadedTweets += numTweet;
    showTweets(tweetList.slice(0, numTweet));
}

getTweets(5);