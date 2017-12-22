document.addEventListener("DOMContentLoaded", function(event) {
	// prepare a connection to crypto-compare's realtime endpoint
	const socket = io.connect('https://streamer.cryptocompare.com/');
	const subscription = [
		'5~CCCAGG~BTC~USD',
		'5~CCCAGG~ETH~USD',
		"5~CCCAGG~LTC~USD",
		"5~CCCAGG~XRP~USD",
		"5~CCCAGG~BCH~USD",
		"5~CCCAGG~ADA~BTC",
	];

	const buildDisplayObject = (data) => {
		const from = data['FROMSYMBOL']
		const to = data['TOSYMBOL']
		const fsym = CCC.STATIC.CURRENCY.getSymbol(from);
		const tsym = CCC.STATIC.CURRENCY.getSymbol(to);
		const pair = `${from}${to}`;

		!currentPrice.hasOwnProperty(pair) ? currentPrice[pair] = {} : undefined ;

		// unpack object contents into new object
		for (const key in data) {
			currentPrice[pair][key] = data[key];
		}

		currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
		currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";
		renderOnFrontend(currentPrice[pair], from, tsym, fsym);
	}

	const render = (chunk) => {
		const type = chunk[0];

		// if the data returned is of our required type, process
		if (type == "5") {
			data = CCC.CURRENT.unpack(message);
			buildDisplayObject(data);
		}

	}

	// main program logic 
	socket.emit('SubAdd', { subs: subscription });
	socket.on("m", function(chunk) {
		render(chunk)
	})

})