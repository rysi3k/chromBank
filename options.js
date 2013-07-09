if(localStorage.logins){
    var inp,els = document.querySelectorAll('input[name^=login]');
    for(var i in els) {
        if(!els[i].name) continue;
        inp = els[i].name.substr(6);
        inp = inp.substr(0,inp.length-1);
        els[i].value =  JSON.parse(localStorage.logins)[inp] || '';
    }
}
if(localStorage.passwords){
     var inp,els = document.querySelectorAll('input[name^=pass]');
    for(var i in els) {
        if(!els[i].name) continue;
        inp = els[i].name.substr(5);
        inp = inp.substr(0,inp.length-1);
        els[i].value =  JSON.parse(localStorage.passwords)[inp] || '';
    }
}
if(localStorage.notis) {
    document.querySelector('select[name="notis[enable]"]').value = (JSON.parse(localStorage.notis)['enable'] || 1) ? 1 : 0;
    document.querySelector('select[name="notis[interval]"]').value = JSON.parse(localStorage.notis)['interval'] || 900;
}

document.getElementById('form').onsubmit = function() {
    var logins={},passwords={}, inp,els = document.querySelectorAll('input[name^=login]');
    for(var i in els) {
        if(!els[i].name) continue;
        inp = els[i].name.substr(6);
        inp = inp.substr(0,inp.length-1);
        logins[inp] =  els[i].value;
    }
    els = document.querySelectorAll('input[name^=pass]');
    for(i in els) {
        if(!els[i].name) continue;
        inp = els[i].name.substr(5);
        inp = inp.substr(0,inp.length-1);
        passwords[inp] =  els[i].value;
    }
    localStorage.logins = JSON.stringify(logins);
    localStorage.passwords = JSON.stringify(passwords);
    localStorage.notis = JSON.stringify({
        enable: document.querySelector('select[name="notis[enable]"]').value==="1",
        interval: Math.max(900,parseInt(document.querySelector('select[name="notis[interval]"]').value,10))
    });
    document.getElementById('msg').textContent = 'Zapisano!';
    var bg = chrome.extension.getBackgroundPage();
    bg.Banks.init();
    if(window.location.hash == '#popup'){
        window.location = 'popup.html';
    }else{
       // window.close();
    }
    return false;
};

