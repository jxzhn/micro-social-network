var TEST_FLAG = true;

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
    userId: userId
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
                if(TEST_FLAG) isFollowing = checkFollowTest.currentUserFollowing;
                else isFollowing = await ajax.post("/user/checkFollow", userIdToSend).currentUserFollowing;
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
        if(TEST_FLAG)userInfo = userInfoTest.user;
        else userInfo = await ajax.post("/user/userInfo", userIdToSend);
    }
    catch(err){
        console.log(err);
    }
    infoId.innerHTML = userInfo.userId;
    for(i in userName){
        userName[i].innerHTML = userInfo.userName;
    }
    introduction.innerHTML = userInfo.introduction;
    banner.style.backgroundImage = "url(" + userInfo.backgroundImage + ")";
    avatar.style.backgroundImage = "url(" + userInfo.avatar + ")";

    //TODO: init popup info
    edit_banner.style.backgroundImage = banner.style.backgroundImage;
    edit_avatar.style.backgroundImage = avatar.style.backgroundImage;
    edit_name.value = userName[0].innerHTML;
    edit_introduction.value = introduction.innerHTML;
    bannerDataURL = userInfo.backgroundImage;
    avatarDataURL = userInfo.avatar;
    //TODO: init follow href
    following.href = "./follow.html" + "?id=" + userId +"&followType=following";
    followed.href = "./follow.html" + "?id=" + userId +"&followType=followed";
}
initProfilePage();

//---------------------- Page function---------------------- 
async function follow(){
    isFollowing = true;
    try{
        var followInfo = {
            userIdFollowed: userId,
            createTime:  new Date().getTime() / 1000
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
        console.log(userIdToSend);
        if(!TEST_FLAG)await ajax.post("/user/unfollow", userIdToSend);
    }
    catch(err){
        console.log(err);
    }
    setFollowBtn();
}

function unfollowBtnMouseover(){
    unfollowBtn.innerHTML = "取消关注";
    unfollowBtn.style.backgroundColor = "var(--unfollow-red)";
}
function unfollowBtnMouseout(){
    unfollowBtn.innerHTML = "关注中";
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
    showPopup('edit-popup');
}

function updateEditBanner(files){
    console.log("new");
    var imageType = /^image\//;
    if (!files.length || !imageType.test(files[0].type)) {
        return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
        bannerDataURL = e.target.result;
        edit_banner.style.backgroundImage = `url(${bannerDataURL})`;
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
        edit_avatar.style.backgroundImage = `url(${avatarDataURL})`;
    }
    reader.readAsDataURL(files[0]);
}
edit_introduction.addEventListener('keypress', (e)=>{
    if(e.keyCode == 13){
        e.preventDefault();
        return false;
    }
})
function updateInfo(){
    if(edit_name.value.length == 0 || edit_introduction.value.length == 0){
        edit_errormsg.innerHTML = "昵称或简介不得为空";
        succ_flag = false;
        return;
    }
    banner.style.backgroundImage = `url(${bannerDataURL})`;
    avatar.style.backgroundImage = `url(${avatarDataURL})`;
    for(i in  userName){
        userName[i].innerHTML = edit_name.value;
    }
    introduction.innerHTML = edit_introduction.value;
}
async function saveEdit(){
    edit_errormsg.innerHTML = "";
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
    if(edit_errormsg.innerHTML.length == 0){
        hidePopup('edit-popup');
    }
}

function cancelEdit(){
    hidePopup('edit-popup');
    edit_errormsg.innerHTML = "";
}

var checkFollowTest = {
    "currentUserFollowing": 0
}

var userInfoTest = {
    "user" : {
        "userId" : "111111",
        "userName" : "hu",
        "avatar" : "https://avatars.githubusercontent.com/u/84268960?v=4",
        "introduction": "this is a long long long introduction",
        "createTime" : 1624269255,
        "backgroundImage" : "https://avatars.githubusercontent.com/u/84268960?v=4"
    }
}