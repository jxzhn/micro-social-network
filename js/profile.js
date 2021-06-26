//---------------------- Init Page---------------------- 
var banner = document.getElementById("banner");
var avatar = document.getElementById("avatar");
var infoId = document.getElementById("userId");
var userName = document.getElementsByClassName("userName");
var introduction = document.getElementById("introduction");

var editBtn = document.getElementById('editBtn');
var followBtn = document.getElementById('followBtn');
var unfollowBtn = document.getElementById('unfollowBtn');

var following =  document.getElementById('following');
var followed =  document.getElementById('followed');

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

var userId = getQueryVariable("id");
var userIdToSend = {
    userId: userId,
    full: true
}
var userInfo = {}
var isFollowing = true;
function setEditBtn(){
    editBtn.style.display = "block";
    followBtn.style.display = "none";
    unfollowBtn.style.display = "none";
}
function setFollowBtn(){
    editBtn.style.display = "none";
    followBtn.style.display = "block";
    unfollowBtn.style.display = "none";
}
function setCancelFollowBtn(){
    editBtn.style.display = "none";
    followBtn.style.display = "none";
    unfollowBtn.style.display = "block";
}
async function initProfilePage(){
    var currentUser = await currentUserInfoPromise;
    var returnBtn = document.getElementById("return");
    var nav = document.getElementById("nav");
    var userIcon = document.getElementById("userIcon");
     //个人主页进入
    if(!userId){ 
        userId = currentUser.userId;
        userIdToSend.userId = userId;
        nav.lastElementChild.classList.add("nav-righthere");
        setEditBtn();
    }
    else{ //头像进入
        returnBtn.style.display = "inline-block";
        nav.lastElementChild.firstElementChild.href = "./profile.html";
        nav.lastElementChild.firstElementChild.onclick = null;
        userIcon.classList.remove("fas");
        userIcon.classList.add("far");
        //还是个人主页
        if(userId == currentUser.userId){
            setEditBtn();
        }
        //他人的主页
        else{
            try{
                console.log("send to /user/checkFollow:");
                console.log(userIdToSend);
                isFollowing = (await ajax.post("/user/checkFollow", userIdToSend)).currentUserFollowing;
            }
            catch(err){
                console.log(err);
            }
            if(isFollowing){
                setCancelFollowBtn();
            }
            else{
                setFollowBtn();
            }
        }
    }
    //TODO: set Main by userInfo
    try{
        console.log("send to /user/userInfo:");
        console.log(userIdToSend);
        userInfo = await ajax.post("/user/userInfo", userIdToSend);
    }
    catch(err){
        console.log(err);
    }
    infoId.textContent = "@" + userInfo.user.userId;
    for(i in userName){
        userName[i].textContent = userInfo.user.userName;
    }
    introduction.textContent = userInfo.user.introduction;
    banner.style.backgroundImage = `url("` + userInfo.user.backgroundImage + `")`;
    avatar.style.backgroundImage = `url("` + userInfo.user.avatar + `")`;
    //TODO: set follow num
    var userFollowNum = {}; 
    try{
        console.log("send to /user/userFollowInfo:");
        console.log(userIdToSend);
        userFollowNum = await ajax.post("/user/userFollowInfo", userIdToSend);
    }
    catch(err){
        console.log(err);
    }
    following.textContent = userFollowNum.following;
    followed.textContent = userFollowNum.followed;

    //TODO: init follow href
    var following_href = document.getElementById("following-href");
    var followed_href = document.getElementById("followed-href");
    following_href.href = "./follow.html" + "?id=" + userId +"&followType=following";
    followed_href.href = "./follow.html" + "?id=" + userId +"&followType=followed";
    //TODO: load tweets
    loadMoreTweets(10);
}
initProfilePage();

//---------------------- Page function---------------------- 
async function follow(){
    isFollowing = true;
    try{
        var followInfo = {
            userIdFollowed: userId
        }
        console.log("send to /user/follow:");
        console.log(followInfo);
        if(!TEST_FLAG)await ajax.post("/user/follow", followInfo);
    }
    catch(err){
        console.log(err);
    }
    setCancelFollowBtn();
}
async function unfollow(){
    isFollowing = false;
    try{
        console.log("send to /user/unfollow:");
        var followInfo = {
            userIdFollowed: userId
        }
        console.log(followInfo);
        if(!TEST_FLAG)await ajax.post("/user/unfollow", followInfo);
    }
    catch(err){
        console.log(err);
    }
    setFollowBtn();
}

function unfollowBtnMouseover(){
    unfollowBtn.textContent = "取消关注";
    unfollowBtn.style.backgroundColor = "var(--unfollow-red)";
}
function unfollowBtnMouseout(){
    unfollowBtn.textContent = "关注中";
    unfollowBtn.style.backgroundColor = "var(--primary-theme)";
}

//---------------------- PopUp Related---------------------- 
var edit_errormsg = document.getElementById("edit-errormsg");
var edit_name = document.getElementById("edit-name");
var edit_introduction = document.getElementById("edit-introduction");
var edit_banner = document.getElementById("edit-banner");
var edit_avatar = document.getElementById("edit-avatar");
var bannerDataURL;
var avatarDataURL;
function initPopup(){
    //TODO: init popup info
    edit_banner.style.backgroundImage = banner.style.backgroundImage;
    edit_avatar.style.backgroundImage = avatar.style.backgroundImage;
    edit_name.value = userName[0].textContent;
    edit_introduction.value = introduction.textContent;
    bannerDataURL = banner.style.backgroundImage.slice(5,-2);
    avatarDataURL = avatar.style.backgroundImage.slice(5,-2);
    showPopup('edit-popup');
}

function updateEditBanner(files){
    var imageType = /^image\//;
    if (!files.length || !imageType.test(files[0].type)) {
        return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
        bannerDataURL = e.target.result;
        edit_banner.style.backgroundImage = `url("${bannerDataURL}")`;
        document.getElementById('edit-banner-input').value = null;
    }
    reader.readAsDataURL(files[0]);
}
function updateEditAvatar(files){
    var imageType = /^image\//;
    if (!files.length || !imageType.test(files[0].type)) {
        return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
        avatarDataURL = e.target.result;
        edit_avatar.style.backgroundImage = `url("${avatarDataURL}")`;
        document.getElementById('edit-avatar-input').value = null;
    }
    reader.readAsDataURL(files[0]);
}
edit_introduction.addEventListener('keypress', (e)=>{
    if(e.keyCode == 13){
        e.preventDefault();
        return false;
    }
})


//使用正则表达式过滤js特殊字符(e.g. < >)。即当用户硬是要输入的时候，将<script>的符号去掉，不会被解析。

function hasIllegalChar(str) {
    console.log(str);
    return new RegExp("<.*?>").test(str);
}
function updateInfo(){
    if(hasIllegalChar(edit_name.value)==true)
    {
        edit_errormsg.textContent = "昵称中含有非法字符";
        return;
    }
    if(hasIllegalChar(edit_introduction.value)==true)
    {
        edit_errormsg.textContent = "简介中含有非法字符";
        return;
    }
    if(edit_name.value.length == 0 || edit_introduction.value.length == 0){
        edit_errormsg.textContent = "昵称或简介不得为空";
        succ_flag = false;
        return;
    }
    banner.style.backgroundImage = `url("${bannerDataURL}")`;
    avatar.style.backgroundImage = `url("${avatarDataURL}")`;
    for(i in  userName){
        userName[i].textContent = edit_name.value;
    }
    introduction.textContent = edit_introduction.value;
}


async function saveEdit(){
    edit_errormsg.textContent = "";
    //TODO: save info
    try{
        var infoToSend = {
            userName: edit_name.value,
            avatar: avatarDataURL,
            introduction: edit_introduction.value,
            backgroundImage: bannerDataURL
        }
        console.log("send to /user/updateMyInfo:");
        console.log(infoToSend);
        if(!TEST_FLAG) await ajax.post("/user/updateMyInfo", infoToSend);
    }
    catch(err){
        console.log(err);
    }
    updateInfo();
    if(edit_errormsg.textContent.length == 0){
        hidePopup('edit-popup');
    }
}

function cancelEdit(){
    hidePopup('edit-popup');
    edit_errormsg.textContent = "";
}

//--------------------------loading related-----------------------------
var loading = document.getElementById('loading');
var loadingLock = false;
var loadedTweetList = [];

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
        `<img class="tweet-user-img" src="${tweet.user.userImgUrl}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-info-row">\n` + 
                `<span class="tweet-user-name">${tweet.user.userName}</span>\n` + 
                `<span class="tweet-user-id">@${tweet.user.userId}</span>\n` + 
                `<span class="tweet-dot">.</span>\n` + 
                `<span class="tweet-date">${new Date(tweet.date*1000).Format('MM 月 dd 日')}</span>\n` + 
            `</div>\n` + 
            `<div class="tweet-content" onclick="goDetail(${i})">\n` + 
                `<span>${tweet.content}</span>\n` + 
                `<div class="tweet-content-img" style="display: ${tweet.imgUrl?'block':'none'}; background-image: url(${tweet.imgUrl})"></div>\n` + 
            `</div>\n` + 
            `<div class="tweet-interact-row">\n` + 
                `<span class="tweet-comment" onclick="goDetail(${i})"><i class="far fa-comment"></i>${tweet.numComment}</span>\n` + 
                `<span class="tweet-like ${tweet.liked?'tweet-liked':''}" onclick="clickLike(this, ${i});"><i class="${tweet.liked?'fas':'far'} fa-heart"></i>${tweet.numLike}</span>\n` + 
            `</div>\n` + 
        `</div>`

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
            userId: userId,
            timeStamp: Math.round(new Date().getTime() / 1000),
            loadedNum: loadedTweetList.length,
            requestNum: numTweet
        }
        console.log("send to /user/userPostDetail:");
        console.log(infoToSend);
        tweetList = (await ajax.post("/user/userPostDetail", infoToSend)).posts;
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
            if(!TEST_FLAG) await ajax.post("/post/dislike", likeInfo);
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
            if(!TEST_FLAG)await ajax.post("/post/like", likeInfo);
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
