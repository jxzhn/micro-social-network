//---------------------- Init Page---------------------- 
var banner = document.getElementById("banner");
var avatar = document.getElementById("avatar");
var username = document.getElementsByClassName("username");
var introduction = document.getElementById("introduction");

var isFollowed = false;
var isMyPage = true;

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

//--------------------------init page-------------------------
var editBtn = document.getElementById('editBtn');
    var followBtn = document.getElementById('followBtn');
    var followedBtn = document.getElementById('followedBtn');
function initFollowPage(){
}
function setEditBtn(){
    editBtn.style.display = "block";
    followBtn.style.display = "none";
    followedBtn.style.display = "none";
}
function setFollowBtn(){
    editBtn = editBtn.style.display = "none";
    followBtn.style.display = "none";
    followedBtn.style.display = "block";
}
function setFollowedBtn(){
    editBtn = editBtn.style.display = "none";
    followBtn.style.display = "block";
    followedBtn.style.display = "none";
}
function initProfilePage(){
    var returnBtn = document.getElementById("return");
    var sideBarProfile = document.getElementsByClassName("nav-righthere");
    var userIcon = document.getElementById("userIcon");
     //个人主页进入
    if(!getQueryVariable("id")){ 
        returnBtn.style.display = "none";
        setEditBtn();
    }
    else{ //头像进入
        sideBarProfile[0].classList.remove("nav-righthere");
        userIcon.classList.remove("fas");
        userIcon.classList.add("far");
    }
}
initProfilePage();

//---------------------- Page function---------------------- 
function follow(){
    isFollowed = true;
    setButtons();
    //TODO:updateDB
}
function cancelFollow(){
    isFollowed = false;
    setButtons();
    //TODO:updateDB
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