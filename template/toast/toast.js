// template/toast/toast.js
const utilCommon = require('../../utils/utilCommon')
let _compData = {
    'azm_toast.isHide': false,
    'azm_toast.content': ''
};
let toastPannel = {
    showToast() {

        let self = this, text, time, data = arguments[0];
        if (utilCommon.isString(data)) {
            text = data;
            time = 2500
        } else if (utilCommon.isObject(data) && !utilCommon.isEmptyObject(data)) {
            text = data.text || '';
            time = Number(data.time) || 3000;
        }
        this.setData({
            'azm_toast.isHide': true,
            'azm_toast.content': text
        });
        setTimeout(() => {
            this.setData({
                'azm_toast.isHide': false
            });
        }, time)
    }
};

function ToastPannel() {
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, toastPannel);
    curPage.toastPannel = this;
    curPage.setData(_compData);
    return this;
}

module.exports = {
    ToastPannel
};