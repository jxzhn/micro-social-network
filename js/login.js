var userId = document.getElementById("userId");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");

async function login() {
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
        errormsg.innerHTML = err;
    }
}
