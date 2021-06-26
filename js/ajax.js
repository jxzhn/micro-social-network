const baseURL = 'jsp';
const surffix = '.jsp'

function praseErrorCode(resp, resolve, reject) {
    if (resp.code == 0) {
       resolve(resp.data);
    } 
    if (resp.code == 1001) { // 未登录
        window.location.href = './login.html';
        reject(Error('未登录'));
    } 
    if (resp.code == -1) { //模板
        reject(Error(JSON.stringify(resp)));
    }
    reject(Error(JSON.stringify(resp)));
}

const ajax = {
    post: async (url, data) => {
        return new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('post', baseURL + url + surffix, true);
            xmlhttp.setRequestHeader('content-type', 'application/json');
            xmlhttp.onload = () => {
                if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                    const resp = JSON.parse(xmlhttp.responseText);
                    praseErrorCode(resp, resolve, reject);
                } else {
                    reject(Error('未知: ' + xmlhttp.responseText)); 
                }
            }
            xmlhttp.send(JSON.stringify(data));
        });
    }
}

