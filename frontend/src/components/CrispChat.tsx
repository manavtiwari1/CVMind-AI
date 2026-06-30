import { useEffect } from 'react';

export default function CrispChat() {
  useEffect(() => {
    const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID;

    // Check if the variable is unset or contains the placeholder string
    if (!websiteId || websiteId === 'your_crisp_website_id_here') {
      console.warn(
        "Crisp Chat Widget is loaded but not yet configured.\n" +
        "Please update VITE_CRISP_WEBSITE_ID in your frontend .env file with your actual website ID from the Crisp dashboard."
      );
      return;
    }

    // Initialize Crisp
    (window as any).$crisp = (window as any).$crisp || [];
    (window as any).CRISP_WEBSITE_ID = websiteId;

    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;

    const head = document.getElementsByTagName("head")[0];
    if (head) {
      head.appendChild(s);
    }

    // Hide the chat widget icon by default once loaded
    (window as any).$crisp.push(["do", "chat:hide"]);

    // Hide the icon again when the user closes/minimizes the chatbox
    (window as any).$crisp.push(["on", "chat:closed", () => {
      (window as any).$crisp.push(["do", "chat:hide"]);
    }]);

    return () => {
      // Cleanup script element on unmount
      s.remove();

      // Cleanup Crisp global objects
      delete (window as any).$crisp;
      delete (window as any).CRISP_WEBSITE_ID;

      // Remove Crisp widgets from DOM
      const crispContainer = document.getElementById('crisp-chatbox') || 
                             document.querySelector('.crisp-client');
      if (crispContainer) {
        crispContainer.remove();
      }
    };
  }, []);

  return null; // This component does not render any visible HTML elements itself
}
