var loading = document.getElementById('loading');
var loadingLock = false;
var userList = [];
var curNo = 0; //下一次开始载入的列表下标

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

var userId =  getQueryVariable('id');
var userIdToSend = {
    userId: userId
}
var followType = getQueryVariable('followType');
var curFollowType = followType;
//--------------------------init page-------------------------
var following_select = document.getElementById("following-select");
var followed_select = document.getElementById("followed-select");

async function initFollowPage(){
    var currentUser = await currentUserInfoPromise;
    var following_label = document.getElementById("following-label");
    var followed_label = document.getElementById("followed-label");
    var userName = document.getElementById("userName");
    try{
        console.log("send to /user/userInfo:");
        console.log(userIdToSend);
        var userInfo = await ajax.post("/user/userInfo");
        // var userInfo = {
        //     userName: "tempUserName"
        // }
        userName.innerHTML = userInfo.userName;
    }
    catch(err){
        console.log(err);
    }
    if(userId == currentUser.userId){
        following_label.innerHTML = "我的关注";
        followed_label.innerHTML = "我的粉丝";
    }
    else{
        following_label.innerHTML = "TA的关注";
        followed_label.innerHTML = "TA的粉丝";
    }
    if(followType == "following"){
        following_select.classList.add("follow-select-selected");
        loadFollowing();
    }
    else{
        followed_select.classList.add("follow-select-selected");
        loadFollowed();
    }
}

initFollowPage();
//----------------------page function--------------------------
const scrollToTop = () => {
    const fromTopDistance = document.documentElement.scrollTop || document.body.scrollTop;
    if (fromTopDistance > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, fromTopDistance - fromTopDistance/ 8);
    }
}

function selectFollowing(){
    if(curFollowType == "followed"){
        following_select.classList.add("follow-select-selected");
        followed_select.classList.remove("follow-select-selected");
        curFollowType = "following";
        loading.parentNode.innerHTML = `<div id="loading">\n`+
           `<span><i class="fas fa-circle-notch fa-spin"></i>正在加载...</span>\n`+
       `</div>\n`;
        loading = document.getElementById('loading');
        loadFollowing();
    }
    else{
        scrollToTop();
    }
}

function selectFollowed(){
    if(curFollowType == "following"){
        following_select.classList.remove("follow-select-selected");
        followed_select.classList.add("follow-select-selected");
        curFollowType = "followed";    
        loading.parentNode.innerHTML = `<div id="loading">\n`+
           `<span><i class="fas fa-circle-notch fa-spin"></i>正在加载...</span>\n`+
        `</div>\n`;
        loading = document.getElementById('loading');
        loadFollowed();
    }
    else{
        scrollToTop();
    }
}

async function loadFollowing(){
    // 用 AJAX 向服务器请求 numTweet 条数据，这里先弄点假数据
    try{
        console.log("send to /user/followList:");
        console.log(userIdToSend);
        userList = (await ajax.post("/user/followList", userIdToSend)).follows;
        // userList = testRes.follows;
    }
    catch(err){
        console.log(err);
    }
    loadMoreTweets();
}
async function loadFollowed(){
    // userList = followedList;
    try{
        console.log("send to /user/fansList:");
        console.log(userIdToSend);
        userList = (await ajax.post("/user/fansList", userIdToSend)).fans;
        // userList = testRes.follows;
    }
    catch(err){
        console.log(err);
    }
    loadMoreTweets();
}
//----------------------follow button related--------------------------
async function follow(obj){
    var followInfo = {
        userIdFollowed: obj.parentNode.previousElementSibling.firstElementChild.lastElementChild.getAttribute("name"),
        createTime:  new Date().getTime() / 1000
    }
    try{
        console.log("send to /user/follow:");
        console.log(followInfo);
        await ajax.post("/user/follow", followInfo);
    }
    catch(err){
        console.log(err);
    }
    obj.parentNode.innerHTML = `<button class="unfollowBtn solid-button" onclick="unfollow(this)" onmouseover="unfollowBtnMouseover(this)", onmouseout="unfollowBtnMouseout(this)">关注中</button>\n`;
}
async function unfollow(obj){
    var followInfo = {
        userIdFollowed: obj.parentNode.previousElementSibling.firstElementChild.lastElementChild.getAttribute("name"),
    }
    try{
        console.log("send to /user/unfollow:");
        console.log(followInfo);
        await ajax.post("/user/unfollow", followInfo);
    }
    catch(err){
        console.log(err);
    }
    obj.parentNode.innerHTML = `<button class="followBtn hollow-button" onclick="follow(this)">关注</button>\n`;
}
function unfollowBtnMouseover(obj){
    obj.innerHTML = "取消关注";
    obj.style.backgroundColor = "var(--unfollow-red)";
}
function unfollowBtnMouseout(obj){
    obj.innerHTML = "关注中";
    obj.style.backgroundColor = "var(--primary-theme)";
}

//----------------------loading--------------------------
function showTweets() {
    for(i in userList) {
        var tweet = userList[i];
        var block = document.createElement('div');
        block.classList.add('tweet-block');
        var btn = tweet.user.currentUserFollowing ? 
                `<button class="followBtn hollow-button" onclick="follow(this)">关注</button>`:
                `<button class="unfollowBtn solid-button" onclick="unfollow(this)" onmouseover="unfollowBtnMouseover(this)", onmouseout="unfollowBtnMouseout(this)" >关注中</button>`;
        block.innerHTML =
        `<img onclick="goUserProfile(${i})" class="tweet-user-img" src="${tweet.user.avatar}">\n` +
        `<div class="tweet-detail">\n` + 
            `<div class="tweet-leftInfo">\n` + 
                `<div class="tweet-info-row">\n` + 
                    `<span class="tweet-user-name" onclick="goUserProfile(${i})">${tweet.user.userName}</span><br>\n` + 
                    `<span name="${tweet.user.userId}" class="tweet-user-id" onclick="goUserProfile(${i})">@${tweet.user.userId}</span>\n` + 
                `</div>\n` + 
                `<div class="tweet-content" onclick="goDetail(${i})">\n` + 
                    `<span>${tweet.user.introduction.length > 30 ? tweet.user.introduction.substring(0 ,30) + '...' : tweet.user.introduction}</span>\n` + 
                `</div>\n` +
            `</div>\n` + 
            `<div class="tweet-followBtns">\n` + 
                btn + `\n` + 
            `</div>\n` + 
        `</div>`
        loading.parentNode.insertBefore(block, loading);
    }
}

function loadMoreTweets() {
    if (loadingLock) {
        return;
    }
    loadingLock = true;
    loading.style.display = 'block';
    showTweets();
    loading.style.display = 'none';
    loadingLock = false;
}

function goUserProfile(i) {
    window.location.href = "./profile.html?id=" + userList[i].user.userId;
}

var testRes = {
    "length" : 2,
    "follows" : [
        {
            "user" : {
                "userId" : "12345",
                "userName" : "hu",
                "avatar" : "https://avatars.githubusercontent.com/u/84268960?v=4",
                "introduction": "just test just test just test just test just test just test just test",
                "currentUserFollowing": 1
            }
        },
        {
            "user" : {
                "userId" : "22345",
                "userName" : "hu",
                "avatar" : "https://avatars.githubusercontent.com/u/84268960?v=4",
                "introduction": "just test just test just test just test just test just test just test",
                "currentUserFollowing": 0
            }
        },
        {
            "user" : {
                "userId" : "32345",
                "userName" : "hu",
                "avatar" : "https://avatars.githubusercontent.com/u/84268960?v=4",
                "introduction": "just test just test just test just test just test just test just test",
                "currentUserFollowing": 0
            }
        },
        {
            "user" : {
                "userId" : "42345",
                "userName" : "hu",
                "avatar" : "https://avatars.githubusercontent.com/u/84268960?v=4",
                "introduction": "just test just test just test just test just test just test just test",
                "currentUserFollowing": 1
            }
        }
    ]
}