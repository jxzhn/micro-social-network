//---------------------- Init Page---------------------- 
var banner = document.getElementById("banner");
var avatar = document.getElementById("avatar");
var username = document.getElementsByClassName("username");
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
var isFollowing = true;//FIXME:
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
function setMainbyId(Id){
    //TODO:
}
async function initProfilePage(){
    var currentUser = await currentUserInfoPromise;
    var returnBtn = document.getElementById("return");
    var nav = document.getElementById("nav");
    // var sideBarProfile = document.getElementsByClassName("nav-righthere");
    var userIcon = document.getElementById("userIcon");
     //个人主页进入
    if(!userId){ 
        userId = currentUser.userId;
        nav.lastElementChild.classList.add("nav-righthere");
        console.log(nav.lastElementChild.firstElementChild);
        setMainbyId(currentUser.userId);
        setEditBtn();
    }
    else{ //头像进入
        returnBtn.style.display = "inline-block";
        nav.lastElementChild.firstElementChild.href = "./profile.html";
        nav.lastElementChild.firstElementChild.onclick = null;
        userIcon.classList.remove("fas");
        userIcon.classList.add("far");
        setMainbyId(userId);
        //还是个人主页
        if(userId == currentUser.userId){
            setEditBtn();
        }
        else if(isFollowing){
            setCancelFollowBtn();
        }
        else{
            setFollowBtn();
        }
    }
    following.href = "./follow.html" + "?id=" + userId +"&followType=following";
    followed.href = "./follow.html" + "?id=" + userId +"&followType=followed";
}
initProfilePage();

//---------------------- Page function---------------------- 
function follow(){
    isFollowing = true;
    setCancelFollowBtn();
    //TODO:updateDB
}
function unfollow(){
    console.log("test");
    isFollowing = false;
    setFollowBtn();
    //TODO:updateDB
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
edit_banner.style.backgroundImage = banner.style.backgroundImage;
edit_avatar.style.backgroundImage = avatar.style.backgroundImage;
edit_name.value = username[0].innerHTML;
edit_introduction.value = introduction.innerHTML;
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
    for(var i = 0; i < username.length; i++){
        username[i].innerHTML = edit_name.value;
    }
    introduction.innerHTML = edit_introduction.value;
}
function saveEdit(){
    edit_errormsg.innerHTML = "";
    //TODO:updateDB
    //send bannerDataURL，avatarDataURL;
    console.log(bannerDataURL);
    console.log(avatarDataURL);
    console.log(edit_name.value);
    console.log(edit_introduction.value);
    if(bannerDataURL!=null){
        banner.style.backgroundImage = `url(${bannerDataURL})`;
    }
    if(avatarDataURL!=null){
        avatar.style.backgroundImage = `url(${avatarDataURL})`;
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