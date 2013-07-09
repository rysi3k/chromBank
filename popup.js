var bg = chrome.extension.getBackgroundPage();

var c = 0;
var loadAccounts = function() {
	var r = bg.Banks.isReady();
	if(r === -1) {
         window.location = 'options.html#popup';
	} else if(r === false) {
		if(c<30) {
			$('#msg').html('Ładowanie... ('+(++c)+')');
			setTimeout(loadAccounts, 500);
		} else {
			$('#msg').html('Przekroczono czas połączenia');
		}
	} else {
		var list = bg.Banks.getList(), html='';

		for(var i in list) {
			html += '<tr><th colspan="3">'+i+'</th></tr>';
			html+= '<tr><td>&nbsp;</td><td>saldo:</td><td>środki:</td></tr>';
			for(var j in list[i]) {
				var a = list[i][j];
				html+= '<tr><td>'+a.name+'</td><td>' + a.balance + '</td><td><strong>' + a.cash + '</strong></td></tr>';
			}
		}
		$('#msg').html('');
		$('#result').html(html);
	}
};

loadAccounts();