// Global variables to hold the picked element and its stored context.
let pickedElement = null;
let elementContext = null;

/**
 * Displays a toast message that automatically disappears.
 * @param {string} message - The message to display.
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  // Style the toast.
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '14px';
  // Optionally add a fade-out transition (requires additional CSS for full effect).
  toast.style.transition = 'opacity 0.5s ease-out';
  document.body.appendChild(toast);
  
  // Remove the toast after 3 seconds.
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/**
 * Puts the page into picker mode.
 * Highlights elements under the cursor and lets you click to select one.
 */
function enablePicker() {
  // Change the cursor to indicate picker mode.
  document.body.style.cursor = 'crosshair';

  // Mouseover: add a red dashed outline.
  function mouseOverHandler(event) {
    // Optionally, ignore events from the toast if necessary.
    event.target.style.outline = '2px dashed red';
  }

  // Mouseout: remove the red dashed outline.
  function mouseOutHandler(event) {
    event.target.style.outline = '';
  }

  // Click: select the element, remove hover effects, and show a toast.
  function clickHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    // Remove the event listeners.
    document.removeEventListener('mouseover', mouseOverHandler, true);
    document.removeEventListener('mouseout', mouseOutHandler, true);
    document.removeEventListener('click', clickHandler, true);

    // Remove any outline from the selected element.
    event.target.style.outline = '';

    // Save the picked element.
    pickedElement = event.target;

    // Restore the default cursor.
    document.body.style.cursor = '';

    // Show a toast message confirming selection.
    showToast("Element selected! Use Alt+T to toggle it.");
  }

  // Add event listeners in capture mode so they get priority.
  document.addEventListener('mouseover', mouseOverHandler, true);
  document.addEventListener('mouseout', mouseOutHandler, true);
  document.addEventListener('click', clickHandler, true);
}

/**
 * Toggles the picked element:
 * - If the element is present, it removes it from the DOM (storing its context).
 * - If it is removed, it reinserts it at the original location.
 */
function togglePickedElement() {
  if (!pickedElement) {
    showToast("No element selected. Use Alt+P to pick an element.");
    return;
  }

  // If the element is currently in the document, remove it.
  if (document.contains(pickedElement)) {
    // Save the element's context for reinsertion.
    elementContext = {
      parent: pickedElement.parentNode,
      nextSibling: pickedElement.nextSibling
    };
    pickedElement.remove();
    showToast("Element removed. Use Alt+T to restore it.");
  } else if (elementContext) {
    // Reinsert the element at its original location.
    if (elementContext.nextSibling) {
      elementContext.parent.insertBefore(pickedElement, elementContext.nextSibling);
    } else {
      elementContext.parent.appendChild(pickedElement);
    }
    elementContext = null;
    showToast("Element restored. Use Alt+T to remove it again.");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "pick-element") {
	  enablePicker();
	} else if (message.action === "toggle-element") {
	  togglePickedElement();
	}
	// Send a simple response so the port doesn't close prematurely.
	sendResponse({ status: "ok" });
	// No asynchronous response needed, so we don't return true.
  });
  