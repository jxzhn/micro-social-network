var userId = document.getElementById("userId");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");

async function login() {
    //validate
    var login_info = {
        id: userId.value,
        password: password.value
    }
    var res = await ajax.post("./jsp/user/login", login_info);
    console.log(res);
    if(res.code != 0){
        errormsg.innerHTML = res.message;
    }
    else{
        window.location.href = "./index.html";
    }
}
