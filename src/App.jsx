import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// Function to copy styles from the source document to the target document
function copyStyles(sourceDoc, targetDoc) {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    if (styleSheet.cssRules) {
      // for <style> elements
      const newStyleEl = sourceDoc.createElement("style");

      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        // write the text of each rule into the body of the style element
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const newLinkEl = sourceDoc.createElement("link");

      newLinkEl.rel = "stylesheet";
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

// Functional component to create a portal to a new window
const MyWindowPortal = ({ children }) => {
  const containerEl = useRef(document.createElement("div"));
  const externalWindow = useRef(null);

  useEffect(() => {
    // Open a new window and store a reference to it
    externalWindow.current = window.open(
      "",
      "",
      "width=600,height=400,left=200,top=200"
    );

    // Copy styles from the main document to the new window's document
    copyStyles(document, externalWindow.current.document);

    // Append the container <div> to the body of the new window
    externalWindow.current.document.body.appendChild(containerEl.current);

    // Cleanup: This will fire when the component unmounts
    return () => {
      externalWindow.current.close();
    };
  }, []);

  return ReactDOM.createPortal(children, containerEl.current);
};

// Main App component
const App = () => {
  const [counter, setCounter] = useState(0);
  const [showWindowPortal, setShowWindowPortal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => prevCounter + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleWindowPortal = () => {
    setShowWindowPortal((prevShowWindowPortal) => !prevShowWindowPortal);
  };

  return (
    <div>
      <h1>Counter: {counter}</h1>
      <button onClick={toggleWindowPortal}>
        {showWindowPortal ? "Close the" : "Open a"} Portal
      </button>
      {showWindowPortal && (
        <MyWindowPortal>
          <h1>Counter in a portal: {counter}</h1>
          <p>Even though I render in a different window, I share state!</p>
          <button onClick={() => setShowWindowPortal(false)}>Close me!</button>
        </MyWindowPortal>
      )}
    </div>
  );
};  

export default App;
