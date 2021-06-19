function showPopup(popupId) {
    var popup = document.getElementById(popupId);
    // 创建一个 shadow 块
    var shadow = document.createElement('div');
    shadow.id = popupId + '-shadow';
    shadow.classList.add('popup-shadow');
    popup.parentNode.insertBefore(shadow, popup);
    // 显示弹窗
    popup.style.display = 'block';
}

function hidePopup(popupId) {
    var popup = document.getElementById(popupId);
    // 关闭弹窗
    popup.style.display = 'none';
    // 删除 shadow 块
    var shadow = document.getElementById(popupId + '-shadow');
    shadow.parentNode.removeChild(shadow);
}
