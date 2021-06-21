async function callCloudMethod(url, data) {
    return new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('post', url, true);
        xmlhttp.setRequestHeader('content-type', 'application/json');
        xmlhttp.onload = () => {
            if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                resp = JSON.parse(xmlhttp.responseText);
                if (resp.code == 0) {
                    resolve(resp.data);
                } else if (resp.code == 999) { // 未登录
                    window.location.href = '/login.html';
                    reject('未登录');
                } else {
                    reject(resp.msg);
                }
            } else {
                reject('未知: ' + xmlhttp.responseText);
            }
        }
        xmlhttp.send(JSON.stringify(data));
    });
}