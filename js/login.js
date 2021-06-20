var username = document.getElementById("username");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");
function login() {
    //validate
    var error_flag = true;
    if(error_flag){
        errormsg.innerHTML = "用户名或密码错误";
    }
}