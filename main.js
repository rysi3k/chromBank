/*

function OperationHistoryExport(export_checkbox, checked_url, unchecked_url) {
    var obj = document.getElementById('Activity_Data');
    if (obj != null)
        obj.value = '';

    if (export_checkbox.checked) {
        doSubmit(checked_url, '', 'POST', '', true, false, true, null);
    } else
        doSubmit(unchecked_url, '', 'POST', '', true, false, true, null);
    return false;
}


function process(html, url) {
    url = url.substr(MBANK.length + 1);
    if (html.indexOf('errorView') !== -1) {
        $('#msg').text('B³±d logowania lub po³±czenia!');
        return;
    }

    } else if (url == 'account_oper_list.aspx') {
        temp.html($(html).find(FORM));
        if ($('#account_operations').length) {
            $.get(MBANK + "/logout.aspx", function(html) {

            });

            var transactions = [];
            var html = [];

            $('#account_operations li').each(function() {
                var t = $(this);
                if (!t.hasClass('header')) {
                    var p = t.children('p');
                    //                                console.log(p.filter('.OperationDescription'));
                    var t = {
                        operationDate: p.filter('.Date').children('span').eq(0).text(),
                        postingDate: p.filter('.Date').children('span').eq(1).text(),
                        amount: p.filter('.Amount').eq(0).text(),
                        balance: p.filter('.Amount').eq(1).text()
                    }
                    var description = p.filter('.OperationDescription');
                    t.type = description.children('a').text();
                    var spans = description.children('span');
                    if (spans.length == 2) {
                        t.name = spans.eq(1).text();
                    } else {
                        t.name = spans.eq(0).text();
                    }
                    transactions.push(t);
                    var date = t['postingDate'];
                    html.push('<tr><td class="date">' + date + '</td><td class="name">' + t.name + '</td><td class="amount">' + t.amount + '</td></tr>');
                }
            });
            $('#result').html(html.join(''));
        } else {
            $('#Submit').click();
        }
    }
}
*/

var mBank = {

    URL:'https://www.mbank.com.pl',
    accounts: [],
    CONTAINER: null,

    init: function(container, login, password, cb) {
        if (!login || !password) return;
        var self = this;
        self.CONTAINER = container;
        cb = cb || $.noop;
        this.accounts = [];
        this.doLogin(login, password, function(result) {
            if(result!='ok') return cb(result);
            self.getAccounts(function(result) {
                if(typeof result == 'object') cb(result);
            });
        });

    },

    getName: function() {
        return 'mBank';
    },

    doLogin: function(login, pass, cb) {
        cb = cb || $.noop;
        var self = this;
        $.get(this.URL, function(html) {
            self.CONTAINER.html($(html).find('#MainForm'));
            $('#customer').val(login);
            $('#password').val(pass);

            $.post(self.URL + '/logon.aspx', $('#MainForm').serialize(), function(html) {
                if (html.indexOf('accounts_list.aspx') !== -1) {
                    cb('ok');
                } else {
                    cb('Błąd logowania lub połączenia!');
                }
            });

        },'html');
    },

    getAccounts: function(cb) {
        cb = cb || $.noop;
        var self = this;
        $.get(this.URL + "/accounts_list.aspx", function(html) {
            self.CONTAINER.html($(html).find('#MainForm'));
            $('#AccountsGrid li:not(.header,.footer)').each(function() {
                var account = {};
                $(this).find('p').each(function(i) {
                    var cssClass = $(this).attr('class');
                    if (cssClass == 'Account') {
                        account.name = $(this).text();
                    } else if (cssClass == 'Amount') {
                        account[ $(this).html().indexOf('oper_list')>-1?'balance':'cash' ] = $(this).text();
                    } else if (cssClass == 'Actions') {
                        if ($(this).children().length === 5) {
                            account.link = $(this).find('a:eq(1)').attr('onclick');
                        } else {
                            account.link = $(this).find('a:eq(2)').attr('onclick');
                        }
                    }
                });
                self.accounts.push(account);

               // $('#msg').html(account[0] + '<span style="float: right">saldo: <strong>' + account[1] + '</strong> ¶rodki: <strong>' + account[2] + '</strong></span>');
           });
            if(self.accounts.length>0)  cb(self.accounts);
            else cb('Brak kont?');
        });
    }


};

var Banks = {

    _list: [mBank],
    accounts_list: {},
    tout: null,

    isReady: function() {
        if (!localStorage.logins || !localStorage.passwords) return -1;
        return Object.keys(this.accounts_list).length>0;
    },

    getList: function() {
        return this.accounts_list;
    },

    init: function() {
        var self = this, list = this._list;
        var logins = JSON.parse(localStorage.logins|| '{}');
        var passwords = JSON.parse(localStorage.passwords|| '{}');
        var notis = JSON.parse(localStorage.notis || '{"enable":true, "interval":900}');
        for(var i in list) {
             var name = list[i].getName();
             $('div#temp_'+name).remove();
             var div = $('<div>').attr('id', 'temp_'+name).appendTo('body');
            list[i].init(div, logins[name] || '', passwords[name] || '', function(res) {
                if(typeof res !== 'object') {
                     webkitNotifications.createNotification(
                      'img/48.png',  // icon url - can be relative
                      'Błąd',  // notification title
                      res  // notification body text
                    ).show();
                     notis.enable = false; //wylaczamy notyfikacje by nie nabic licznika niepoprawnych logowan
                    return;
                }
                if(notis.enable) self.detectChanges(name, res);
                self.accounts_list[name] = res;

                localStorage.accounts_list = JSON.stringify(self.accounts_list);
            });
        }
        if(notis.enable) {
            clearTimeout(this.tout);
            this.tout = setTimeout(function() {
              self.init();
            }, 1000*notis.interval);
        }
    },

    detectChanges: function(name, list) {
        var old = JSON.parse(localStorage.accounts_list || "{}");
        for(var i in list) {
            for(var j in old[name]) {
                if(list[i].name===old[name][j].name && list[i].cash!==old[name][j].cash) {

                    var diff = Math.round(( parseFloat(list[i].cash.replace(',','.').replace(/[^0-9.]/g,'')) - parseFloat(old[name][j].cash.replace(',','.').replace(/[^0-9.]/g,'')) )*100)/100;
                    if(diff>0) diff = '+'+diff;
                    var data = {
                        image: 'img/48.png',
                        title: 'Zmiana na '+name+' - '+list[i].name.replace(/\d{2}\ ?([0-9]{4}\ ?){6}/,''),
                        text: 'Poprzednio: '+old[name][j].cash+"<br>Obecnie: "+list[i].cash+"<br>Różnica: "+diff.toString().replace('.',',')+' PLN'
                    };
                    var notification = webkitNotifications.createHTMLNotification('notis.html#' + encodeURIComponent(JSON.stringify(data)) );

                    notification.show();
                }
            }
        }
    }

};

Banks.init();
