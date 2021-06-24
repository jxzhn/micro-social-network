var userId = document.getElementById("userId");
var password = document.getElementById("password");
var errormsg = document.getElementById("errormsg");


//使用正则表达式过滤js特殊字符(e.g. < >)。即当用户硬是要输入的时候，将<script>的符号去掉，不会被解析。
function stripScript(s)
{
    var pattern =  new RegExp(".*?script[^>]*?.*?(<\/.*?script.*?>)*", "ig");
    var res="";
    while(pattern.test(s)){
        s = s.replace(pattern,"");
    }
    return s;
}

userId.value = "";
password.value = "";

//hasIllegalChar 判断是否含有script非法字符。返回bool: true：含有，验证不通过；false:不含有，验证通过.
function hasIllegalChar(str) {
    return new RegExp(".*?script[^>]*?.*?(<\/.*?script.*?>)*").test(str);
}

async function login() {
    // //test validate or not
    // if(hasIllegalChar(userId.value)==true)
    // {
    //     errormsg.innerHTML = "您输入的用户ID中含有非法字符。请重新输入。";
    //     return;
    // }
    // if(hasIllegalChar(password.value)==true)
    // {
    //     errormsg.innerHTML = "您输入的密码中含有非法字符。请重新输入。";
    //     return;
    // }
    //validate
    userId.value = stripScript(userId.value);
    password.value = stripScript(password.value);

    errormsg.innerHTML = "";
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
