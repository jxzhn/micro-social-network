async function postJsonRequest(url, data) {
    return new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('post', url, true);
        xmlhttp.setRequestHeader('content-type', 'application/json');
        xmlhttp.onload = () => {
            if (xmlhttp.getResponseHeader('content-type').toLowerCase().includes('application/json')) {
                resolve(JSON.parse(xmlhttp.responseText))
            } else {
                reject(xmlhttp);
            }
        }
        xmlhttp.send(JSON.stringify(data));
    });
}