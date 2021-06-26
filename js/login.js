var userId = document.getElementById("userId");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");



function hasIllegalChar(str) {
    return new RegExp("<.*?>").test(str);
}
async function login() {
    //test validate or not
    if(hasIllegalChar(userId.value)==true)
    {
        errormsg.textContent = "您输入的用户ID中含有非法字符";
        return;
    }
    if(hasIllegalChar(password.value)==true)
    {
        errormsg.textContent = "您输入的密码中含有非法字符";
        return;
    }
    //validate
    var loginInfo = {
        id: userId.value,
        password: password.value
    }
    try{
        var res = await ajax.post("/user/login", loginInfo);
        console.log(res);
        window.location.href = "./index.html";
    }
    catch(err){
        console.log(err);
        errormsg.textContent = err.msg;
    }
}

document.getElementById('password').addEventListener('keydown', (e) => {
    // 回车登录
    if (e.keyCode == 13) {
        login();
    }
})