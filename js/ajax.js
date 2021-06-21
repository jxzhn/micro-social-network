const baseURL = '../jsp';
const surffix = '.jsp'

async function praseErrorCode(resp, resolve, reject) {
    if (resp.code == 0) {
       resolve(resp.data);
    } 
    if (resp.code == 999) { // 未登录
        window.location.href = '/login.html';
        reject(Error('未登录'));
    } 
    if (resp.code == -1) { //模板
        reject(Error(''))
    }
    reject(resp.msg);
}

const ajax = {
    get: async (url) => {
        return new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('get', baseURL + url + surffix, true);
            xmlhttp.setRequestHeader('content-type', 'application/json');
            xmlhttp.onload = () => {
                if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                    const resp = JSON.parse(xmlhttp.responseText);
                    return praseErrorCode(resp, resolve, reject);
                } 
                reject(Error('未知: ' + xmlhttp.responseText)); 
            }
            xmlhttp.send();
        })
    },
    post: async (url, data) => {
        return new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('post', baseURL + url + surffix, true);
            xmlhttp.setRequestHeader('content-type', 'application/json');
            xmlhttp.onload = () => {
                if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                    const resp = JSON.parse(xmlhttp.responseText);
                    return praseErrorCode(resp, resolve, reject);
                } 
                reject(Error('未知: ' + xmlhttp.responseText)); 
            }
            xmlhttp.send(JSON.stringify(data));
        });
    },
    delete: async (url, data) => {
        return new Promise((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('delete', baseURL + url + surffix, true);
            xmlhttp.setRequestHeader('content-type', 'application/json');
            xmlhttp.onload = () => {
                if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                    const resp = JSON.parse(xmlhttp.responseText);
                    return praseErrorCode(resp, resolve, reject);
                } 
                reject(Error('未知: ' + xmlhttp.responseText)); 
            }
            xmlhttp.send(JSON.stringify(data));
        });
    }
}

