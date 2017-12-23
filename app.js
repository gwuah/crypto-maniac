cg = 0;
document.addEventListener("DOMContentLoaded", async function(event) {
	// get a handle to the settings button
	const tg_Settings = $("#tg-settings");

	// display faculty
	let extraData = [...$("h5")];
	let changePer24 = extraData.filter((el, i) => (i % 5 == 0));

	// get previous state set by previous child of cryptoManiac
	var useUnsplashBackground = localStorage.getItem('use_unsplash');
	var state = localStorage.getItem("state");

	// timing faculty
	const ONE_SECOND    = 1000 ;
	const UPDATE_INTERVAL = 10 ;
	const TWO_HOURS = (60 * 60 * 1000) * 2;

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

	// temp storage object
	let res = {};

	// HELPER FUNCTIONS
	const normal = () => {
		// remove everything and then display our guys
		// thats why we called minimal first
 		minimal()
 		for (const data of changePer24) { 
 			data.style.display = "block" ;
 		}

	  localStorage.setItem("state", "normal")
	}

	const minimal = () => {
  	for (const data of extraData) { 
  		data.style.display = "none" ; 
  	}

  	localStorage.setItem("state", "minimal")
  }

  const detailed = () => {
  	for (const data of extraData) { 
  		data.style.display = "block" 
   	}

   	localStorage.setItem("state", "detailed")
  }

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


	const getRandomUnsplashPhoto = async () => {
    const CLIENT_ID = '723bbb8a1193556cc9ea8798b2b4e6b9b401c177129bbe0319b48460f86fee4e';
    const _unsplashURL = `https://api.unsplash.com/photos/random?client_id=${CLIENT_ID}&query=nature`;
    
    const data = await fetch(_unsplashURL)
    return await data.json()
  };

	const checkForCachedImage = async () => {

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

  const toggler = function(context) {
  	// check if it has the active class and hide or show based on it presence
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

  /* END OF HELPER FUNCTIONS */


  // -- MAIN PROGRAM LOGIC --

	// update page based on previous user settings
	if (useUnsplashBackground == null) {
		// if there's no settings, set it to true and load image
		// check ln. 250
		$("input[name='use_unsplash']").click()
		localStorage.setItem('use_unsplash', true)
		minimal()
		await checkForCachedImage()

	} else if (useUnsplashBackground == "true") {
		// automatically check the checkbox on a new page
		$("input[name='use_unsplash']").click()
		await checkForCachedImage()

	} else if (useUnsplashBackground == "false") {
		$(".bg__image").css("background", "black")
	}

	// update page based on previous user settings
	if (state == (null || "minimal")) {
		$("#minimal").click()
		minimal()
	} else if (state == "normal") {
		$("#normal").click()
		normal()
	} else if (state == "detailed") {
		$("#detailed").click()
		detailed()
	}


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


  // toggles the settings menu
  tg_Settings.on("click", function(e) {
  	if ($(this).hasClass("fa-spin")) {
  		$(this).removeClass("fa-spin")
  	} else {
  		$(this).addClass("fa-spin");
  	}
  	toggler($(".settings__section"))
  })

  // toggles the credit section
  const creditsBtn = $("#settings__credits");
  creditsBtn.on("click", function(e) {
  	toggler($("#credits"))
  })

  document.addEventListener("click", async function(e) {
  	// console.log(e)
  	if (e.target.name == "settings" ) {
  		if (e.target.id == "minimal") {
  			minimal()
  		} else if (e.target.id == "normal") {
  			normal()
  		} else if (e.target.id == "detailed") {
  			detailed()
  		}
  	} else if (e.target.name == "use_unsplash") {
  		console.log("i was clicked!")
  		var checked = e.target.checked;
  		
  		// update settings in localStorage
  		localStorage.setItem('use_unsplash', checked)

  		if (checked) {
  			// if user selects button, load image from unsplash
  			await checkForCachedImage()
  		} else {
  			// remove background image from frontend
  			$(".bg__image").css("background", "black")
  		}
  	}
  })


});