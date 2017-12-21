
function createHiddenTextElement(text) {
  const textElement = document.createElement('span');
  textElement.textContent = text;
  textElement.style.all = 'unset';
  // prevents scrolling to the end of the page
  textElement.style.position = 'fixed';
  textElement.style.top = 0;
  textElement.style.clip = 'rect(0, 0, 0, 0)';
  // used to preserve spaces and line breaks
  textElement.style.whiteSpace = 'pre';
  // do not inherit user-select (it may be `none`)
  textElement.style.webkitUserSelect = 'text';
  textElement.style.MozUserSelect = 'text';
  textElement.style.msUserSelect = 'text';
  textElement.style.userSelect = 'text';
  return textElement;
}

export function copyToClipboard(text) {
  let isCopied = false;
  const range = document.createRange();
  const selection = document.getSelection();
  const elementToBeCopied = createHiddenTextElement(text);

  try {
    document.body.appendChild(elementToBeCopied);
    range.selectNode(elementToBeCopied);
    selection.empty();
    selection.addRange(range);

    if (!document.execCommand('copy')) {
      throw new Error('copy command was unsuccessful');
    }
    isCopied = true;
  } catch (err) {
    console.warn(`Unable to copy to clipboard. Error: ${err}`); // eslint-disable-line no-console
  } finally {
    if (selection) {
      if (typeof selection.removeRange === 'function') {
        selection.removeRange(range);
      } else {
        selection.removeAllRanges();
      }
    }

    if (elementToBeCopied) {
      document.body.removeChild(elementToBeCopied);
    }
  }

  return isCopied;
}
