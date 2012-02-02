console.log('Lets Buffer like its 1999!');
//****************************************************************************
//
//	This code runs in the window context
//	Doesnt has access to send a a message to the background page
//
//****************************************************************************
var Buffer = function () {
	var buffer = this;

	this.lastFetch = null;
	this.fetch = function(key, callback){
		var outbound = document.getElementById('outbound-fake-protocol'),
			inbound  = document.getElementById('inbound-fake-protocol');

		outbound.setAttribute('action', 'fetch');
		outbound.setAttribute('key', key);

		inbound.onclick = function(){
			var error = inbound.getAttribute('error'),
				data = JSON.parse( inbound.getAttribute('data') );

			buffer.lastFetch = data;
			callback && callback(data, error);
		}

		outbound.click();
	}

	this.store = function(key, value){
		var outbound = document.getElementById('outbound-fake-protocol'),
			inbound  = document.getElementById('inbound-fake-protocol'),
			v = JSON.stringify(value);

		outbound.setAttribute('action', 'store');
		outbound.setAttribute('key'   , key);
		outbound.setAttribute('value' , v);

		inbound.onclick = function(){
			console.log(inbound.getAttribute('message'));
		}

		outbound.click()
	}
}

// This code injects buffer function to the browser.
var s = document.createElement('script');
s.innerHTML = 'window.Buffer = ' + Buffer.toString() + '; window.buffer = new Buffer();';
document.body.appendChild(s);

//*********************************************************************************
//
//	This code run in the extension.
//  No access in the console of the page
//
//*********************************************************************************
var i = document.createElement('button');
i.id = 'inbound-fake-protocol';
i.style.display = 'none';
document.body.appendChild(i);

var b = document.createElement('button');
b.id = 'outbound-fake-protocol';
b.style.display = 'none';
document.body.appendChild(b);

b.onclick = function(e){
	var action = b.getAttribute('action');
	var key = b.getAttribute('key');
	

	if(action == 'fetch'){
		chrome.extension.sendRequest({
			type : 'fetch',
			key  : key
		},function(response) {
			i.setAttribute('error', response.error);
			i.setAttribute('message', response.message);
			i.setAttribute('data'   , response.data || '{}');
			i.click();
		});
	}else if(action == 'store'){
		var value = b.getAttribute('value');

		chrome.extension.sendRequest({
			type  : 'store',
			key   : key,
			value : value
		},function(response) {
			i.setAttribute('message', response.message);
			i.click();
		});
	}else{
		console.warn('no action mapped');
	}
}