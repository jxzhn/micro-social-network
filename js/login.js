var userId = document.getElementById("userId");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");

async function login() {
    //validate
    var loginInfo = {
        id: userId.value,
        password: password.value
    }
    var res = await ajax.post("/user/login", loginInfo);
    console.log(res);
    if(res.code != 0){
        errormsg.innerHTML = res.message;
    }
    else{
        window.location.href = "./index.html";
    }
}
