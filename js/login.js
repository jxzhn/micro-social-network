var username = document.getElementById("username");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");

function login() {
    //validate
    var error_flag = validate(username.value, password.value);
    if(error_flag){
        errormsg.innerHTML = "用户名或密码错误";
    }
    else{
        errormsg.innerHTML = "登陆成功";
    }
}

function validate(username, password) {
    if(username == password){
        return true;
    }
    else{
        return false;
    }
}