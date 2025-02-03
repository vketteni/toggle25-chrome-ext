chrome.commands.onCommand.addListener((command) => {
	if (command === "toggle-element" || command === "pick-element") {
	  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0] && tabs[0].id) {
		  chrome.tabs.sendMessage(tabs[0].id, { action: command }, (response) => {
			if (chrome.runtime.lastError) {
			  console.error("Error sending message:", chrome.runtime.lastError.message);
			}
		  });
		}
	  });
	}
  });
  
  