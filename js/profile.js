//---------------------- Init Page---------------------- 
var banner = document.getElementById("banner");
var avatar = document.getElementById("avatar");
var username = document.getElementsByClassName("username");
var introduction = document.getElementById("introduction");

var isFollowed = false;
var isMyPage = true;

function setButtons(){
    var editbtn = document.getElementById('editbtn');
    var followbtn = document.getElementById('followbtn');
    var followedbtn = document.getElementById('followedbtn');
    if(isMyPage){
        followbtn.style.display = "none";
        followedbtn.style.display = "none";
        editbtn.style.display = "block";
    }
    else{
        editbtn = editbtn.style.display = "none";
        if(isFollowed){
            followbtn.style.display = "none";
            followedbtn.style.display = "block";
        }
        else{
            followbtn.style.display = "block";
            followedbtn.style.display = "none";
        }
    }
}

function initPage(){
    setButtons();
}
initPage();

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