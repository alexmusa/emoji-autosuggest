function addEmoji() {
    var emoji = "😃";
    var script = 'var form = document.activeElement;'
      + 'form.value = (form.value + " ' + emoji + '");'
	  + 'alert("Emoji added!");';
	chrome.tabs.executeScript(null,	{file: 'SemantriaJavaScriptSDK.js'});
    chrome.tabs.executeScript(null,	{file: 'imtootired.js'});
  }

chrome.commands.onCommand.addListener(function(command){
	if (command == "test") {
		addEmoji()
	}
});