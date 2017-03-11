;(function (){
	// the consumer key and secret
	var consumerKey = "e7c19e8a-9077-4531-a36e-75025306c434",
		consumerSecret = "123a02e6-8f68-4909-a80d-439308f54554",
		docsTracker = {};
		
	var x = document.getElementsByClassName("_1mf _1mj")[0];
	var form = x.firstChild.firstChild;
	//var form = document.activeElement;

	function log(message) {
		//document.body.innerHTML += message;
	}

	function getInitialText() {
		return [form.innerHTML];
	}

	function processResponse(analyticData) {
		for(var i=0, data;data=analyticData[i];i++) {
		debugger;
			
			if(data.sentiment_polarity == "positive") {
				form.innerHTML = (form.innerHTML + "😃");
			}
			else if(data.sentiment_polarity == "neutral") {
				form.innerHTML = (form.innerHTML + "😐");
			}
			else if(data.sentiment_polarity == "negative"){
				form.innerHTML = (form.innerHTML + "🙁");
			}
		
			// Printing of document sentiment score
			log(SemantriaActiveSession.tpl("<br><div style='background-color: lightgray'>Document {id}. Sentiment score: {sentiment_score}</div>", data));
			// Printing of document themes
			log("<div style='margin-left: 15px;'/>Document themes:");
			if (data.themes) {
				for(var j=0, theme; theme=data.themes[j]; j++) {
					log(SemantriaActiveSession.tpl("<div style='margin-left: 30px;'/>{title} (sentiment: {sentiment_score})", theme));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No themes were extracted for this text");
			}

			// Printing of document entities
			log("<div style='margin-left: 15px;'/>Entities:");
			if (data['entities']) {
				for(var j=0, entity; entity=data['entities'][j]; j++) {
					log(SemantriaActiveSession.tpl(
						"<div style='margin-left: 30px;'/>{title} : {entity_type} (sentiment: {sentiment_score})", entity
					));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No entities were extracted for this text");
			}
			
			// Printing of document topics
			log("<div style='margin-left: 15px;'/>Topics:");
			if (data.topics) {
				for(var j=0, topic; topic=data.topics[j]; j++) {
					log(SemantriaActiveSession.tpl(
						"<div style='margin-left: 30px;'/>{title} : {type} (strength: {sentiment_score})", topic
					));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No topics were extracted for this text");
			}
			
			// Printing of document categories
			log("<div style='margin-left: 15px;'/>Categories:");
		if (data['auto_categories']) {
				for(var j=0, category; category=data['auto_categories'][j]; j++) {
					log(SemantriaActiveSession.tpl(
						"<div style='margin-left: 30px;'/>{title} : {type} (strength: {sentiment_score})", category
					));
				}
			} else {
				log("<div style='margin-left: 30px;'/>No categories were extracted for this text");
			}
		}
	}

	function receiveResponse() {
		// As Semantria isn't real-time solution you need to wait some time before getting of the processed results
		// Wait two seconds while Semantria process queued document
		var analyticData = [];
		var timeout = setInterval(function() {
			log("Retrieving your processed results...<br>");
			// Requests processed results from Semantria service
			var processedDocuments = SemantriaActiveSession.getProcessedDocuments();

			if (processedDocuments && processedDocuments.length) {
				for (var i=0, res; res=processedDocuments[i]; i++) {
					if (res.id in docsTracker) {
						docsTracker[res.id] = true;
						analyticData.push(res);
					}
				}
			}

			var flag = true;
			for (var item in docsTracker) {
				if (!docsTracker[item]) {
					flag = false;
					break;
				}
			}

			if (flag) {
				clearInterval(timeout);
				processResponse(analyticData);
			}
		}, 2000);
	}

	window.runTestApp = function() {
		var initialTexts = getInitialText();

		log("<h1>Semantria Document processing mode demo.</h1>");
		// session is a global object
		SemantriaActiveSession = new Semantria.Session(consumerKey, consumerSecret, "myApp");
		SemantriaActiveSession.override({
			onError: function() {
				console.warn("onError:");
				console.warn(arguments);
			},

			onRequest: function() {
				console.log("onRequest:");
				console.log(arguments);
			},

			onResponse: function() {
				console.log("onResponse:");
				console.log(arguments);
			},

			onAfterResponse: function() {
				console.log("onAfterResponse:");
				console.log(arguments);
			}
		});

		var subscription = SemantriaActiveSession.getSubscription();

		var outgoingBatch = [];
		for(var i=0, item; item=initialTexts[i]; i++) {
			// Creates a sample document which need to be processed on Semantria
			var id = Math.floor(Math.random() * 10000000);
			outgoingBatch.push({
				id: id.toString(),
				text: item
			});
			docsTracker[id] = false;
			
			if (outgoingBatch.length == subscription.basic_settings.batch_limit) {
				// Queues document for processing on Semantria service
				// Check status from Semantria service
				if (SemantriaActiveSession.queueBatchOfDocuments(outgoingBatch) == 202) {
					log(outgoingBatch.length + " documents queued successfully<br>");
				}
				
				outgoingBatch = [];
			}
		}

		if (outgoingBatch.length > 0) {
			if (SemantriaActiveSession.queueBatchOfDocuments(outgoingBatch) == 202) {
				log(outgoingBatch.length + " documents queued successfully<br>");
			}
		}

		receiveResponse();
	}
})();

runTestApp();