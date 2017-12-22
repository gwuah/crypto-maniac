cg = 0;
document.addEventListener("DOMContentLoaded", async function(event) {

	// connect to stream for realtime data
	const currentPrice = {};
	const socket = io.connect('https://streamer.cryptocompare.com/');
	const subscription = [
		'5~CCCAGG~BTC~USD',
		'5~CCCAGG~ETH~USD',
		"5~CCCAGG~LTC~USD",
		"5~CCCAGG~XRP~USD",
		"5~CCCAGG~BCH~USD",
		"5~CCCAGG~ADA~BTC",
	];


  let res = {} ;

	// request for specific data from server 
	socket.emit('SubAdd', { subs: subscription });
	socket.on("m", function(message) {
		// console.log(message)
		const messageType = message.substring(0, message.indexOf("~"));
		if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
			res = CCC.CURRENT.unpack(message);
			
			dataUnpack(res);
		}
	});

	// asssemble data object from recieved string
	const dataUnpack = function(data) {
		const from = data['FROMSYMBOL']
		const to = data['TOSYMBOL']
		const fsym = CCC.STATIC.CURRENCY.getSymbol(from);
		const tsym = CCC.STATIC.CURRENCY.getSymbol(to);
		const pair = `${from}${to}`;

		if (!currentPrice.hasOwnProperty(pair)) {
			currentPrice[pair] = {};
		}

		for (const key in data) {
			currentPrice[pair][key] = data[key];
		}


		currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
		currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";
		render(currentPrice[pair], from, tsym, fsym, pair);
	};

	// display realtime data on frontend
	const render = function(data, from, tsym, fsym, pair) {
		$(`#PRICE_${from}`).text(data["PRICE"]);
		$(`#CHANGE24HOUR_${from}`).text(data["CHANGE24HOUR"]);
		$(`#CHANGE24HOURPCT_${from}`).text(data["CHANGE24HOURPCT"]);

		$(`#LASTVOLUME_${from}`).text(CCC.convertValueToDisplay(fsym, data["LASTVOLUME"]));
		$(`#LASTVOLUMETO_${from}`).text(CCC.convertValueToDisplay(tsym, data["LASTVOLUMETO"]));

		$(`#VOLUME24HOUR_${from}`).text(CCC.convertValueToDisplay(fsym, data["VOLUME24HOUR"]));
		$(`#VOLUME24HOURTO_${from}`).text(CCC.convertValueToDisplay(tsym, data["VOLUME24HOURTO"]));
	}

	// unsplash

	var useUnsplashBackground = localStorage.getItem('use_unsplash');
	const ONE_SECOND    = 1000 ;
	const UPDATE_INTERVAL = 10 ;
	const TWO_HOURS = (60 * 60 * 1000) * 2;


	getRandomUnsplashPhoto = async () => {
	    const CLIENT_ID = '723bbb8a1193556cc9ea8798b2b4e6b9b401c177129bbe0319b48460f86fee4e';
	    const _unsplashURL = `https://api.unsplash.com/photos/random?client_id=${CLIENT_ID}&query=nature`;
	    
	    const data = await fetch(_unsplashURL)
	    return await data.json()
	};

	checkForCachedImage = async () => {

		// code by the guy who built cryptex

	    // Elements
	    $bgImage     = document.querySelector('.bg__image');
	    $authorName  = document.querySelector('.unsplash__author__name');
	    $authorImage = document.querySelector('.unsplash__author__image');

	    // Get the local storage object if it exists
	    var bgImage = localStorage.getItem('unsplash_data_obj');
	    var timeToExpire = parseFloat(localStorage.getItem('unsplash_data_time_expiry')) || 0

	    // UTM params for Unsplash
	    const UTMParams = '?utm_source=CRYPTOMANIAC&utm_medium=referral&utm_campaign=api-credit';

	    var d = new Date(),
	        now = Date.now(),
	        addTwoHours = now + TWO_HOURS;

	    console.log(now, addTwoHours);

	    if (!bgImage || now > timeToExpire)   {
	        var data = await getRandomUnsplashPhoto()

	        var backgroundImageUrl = data.urls.regular;

	        console.log(data);

	        $bgImage.style.backgroundImage = `url(${data.urls.regular})`;
	        $authorImage.setAttribute('src', data.user.profile_image.large);
	        $authorName.setAttribute('href', data.user.links.html + UTMParams);
	        $authorName.innerHTML = data.user.name;

	        // Build an object to store in local storage
	        var backgroundImageData = {
	            user_name: data.user.name,
	            user_profile_url: data.user.links.html,
	            user_profile_image_url: data.user.profile_image.large,
	            background_image: data.urls.regular
	        };


	        // Set the stringified localStorage obj
	        localStorage.setItem('unsplash_data_obj', JSON.stringify(backgroundImageData));
	        localStorage.setItem('unsplash_data_time_expiry', addTwoHours);
	        
	    } else {
	        var completeObj = JSON.parse(bgImage);

	        $bgImage.style.backgroundImage = `url(${completeObj.background_image})`;
	        $authorImage.setAttribute('src', completeObj.user_profile_image_url);
	        $authorName.setAttribute('href', completeObj.user_profile_url + UTMParams);
	        $authorName.innerHTML = completeObj.user_name;
	    }
	  }

	  let extraData = [...$("h5")];
	  let changePer24 = extraData.filter((el, i) => { 
	   	if (i % 5 == 0) return true;
	  });

	   const normal = (truthy) => {

	   	const displayCP24 = (changePer24) => {
	   		minimal(true)
	   		for (const data of changePer24) { 
	   			data.style.display = "block" 
	   		}
	   	}

	   	const hideCP24 = (changePer24) => {
	   		minimal(false)
	   		for (const data of changePer24) { 
	   			data.style.display = "none" 
	   		}
	   	}

	   	// if its checked, display ; else hide
	   	truthy ? displayCP24(changePer24) : hideCP24(changePer24) ;

	  }

	   const minimal = (truthy) => {

	   	const displayAll = (extraData) => {
	   		for (const data of extraData) { 
	   			data.style.display = "block" 
	   		}
	   	}

	   	const hideAll = (extraData) => {
	   		for (const data of extraData) { 
	   			data.style.display = "none" 
	   		}
	   	}

	   	truthy ? hideAll(extraData) : displayAll(extraData);
	  }

	  const detailed = (truthy) => {
	  	const displayAll = (extraData) => {
	   		for (const data of extraData) { 
	   			data.style.display = "block" 
	   		}
	   	}
	   	truthy ? displayAll(extraData) : undefined;
	  }

	  // EVENT LISTENERS

	  // toggleWrapper 
	  const toggler = function(context) {
	  	if ($(context).hasClass("active")) {
	  		$(context).fadeOut(() => {
	  			$(context).removeClass("active")
	  		})
	  	} else {
	  		$(context).fadeIn(() => {
	  			$(context).addClass("active")
	  		})
	  	}
	  }

	  // toggles the settings menu
	  const tg_Settings = $("#tg-settings");
	  tg_Settings.on("click", function(e) {
	  	toggler($(".settings__section"))
	  })

	  // toggles the credit section
	  const creditsBtn = $("#settings__credits");
	  creditsBtn.on("click", function(e) {
	  	toggler($("#credits"))
	  })

	  document.addEventListener("click", function(e) {
	  	// console.log(e)
	  	if (e.target.name == "settings" ) {
	  		if (e.target.id == "minimal") {
	  			minimal(e.target.checked)
	  		} else if (e.target.id == "normal") {
	  			normal(e.target.checked)
	  		} else if (e.target.id == "detailed") {
	  			// display every data
	  			detailed(e.target.checked)
	  		}
	  	}
	  })



	   // await checkForCachedImage();


	});