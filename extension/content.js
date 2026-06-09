(function () {
  let profileData = null;

  // Retrieve cached profile data on load
  chrome.storage.local.get(['cvmind_profile'], function (result) {
    if (result && result.cvmind_profile) {
      profileData = result.cvmind_profile;
      injectWidget();
    }
  });

  function injectWidget() {
    // Prevent duplicate widgets
    if (document.getElementById('cvmind-autofill-root')) return;

    const widget = document.createElement('div');
    widget.id = 'cvmind-autofill-root';
    widget.className = 'cvmind-autofill-widget';
    widget.innerHTML = `
      <span class="cvmind-widget-sparkle">✨</span>
      <span>Autofill with CVmind</span>
      <span id="cvmind-status" class="cvmind-widget-status"></span>
    `;

    document.body.appendChild(widget);

    widget.addEventListener('click', function () {
      if (!profileData) return;

      const statusEl = document.getElementById('cvmind-status');
      statusEl.textContent = '(Filling...)';

      const filledCount = performAutofill(profileData);

      setTimeout(() => {
        statusEl.textContent = `(Filled ${filledCount} fields! ✓)`;
        setTimeout(() => {
          statusEl.textContent = '';
        }, 3000);
      }, 500);
    });
  }

  function performAutofill(data) {
    let count = 0;
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Skip hidden inputs
      if (input.type === 'hidden' || input.style.display === 'none' || input.style.visibility === 'hidden') {
        return;
      }

      // Gather form element attributes for analysis
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      
      // Get associated label text
      let labelText = '';
      if (input.id) {
        const labelEl = document.querySelector(`label[for="${input.id}"]`);
        if (labelEl) {
          labelText = labelEl.textContent.toLowerCase();
        }
      }
      if (!labelText) {
        // Fallback: Check parent container or preceding text
        const parent = input.parentElement;
        if (parent) {
          labelText = parent.textContent.toLowerCase();
        }
      }

      const matchText = `${id} ${name} ${placeholder} ${ariaLabel} ${labelText}`;

      // Mapping rules
      let valueToFill = null;

      // 1. Email
      if (/email|e-mail|mail/i.test(matchText) && !/company|referrer|employer/i.test(matchText)) {
        valueToFill = data.email;
      }
      // 2. Phone
      else if (/phone|telephone|mobile|contact|cell/i.test(matchText)) {
        valueToFill = data.phone || data.mobile || '';
      }
      // 3. First Name
      else if (/first.*name|given.*name|fname/i.test(matchText)) {
        valueToFill = getFirstName(data.name);
      }
      // 4. Last Name
      else if (/last.*name|sur.*name|lname/i.test(matchText)) {
        valueToFill = getLastName(data.name);
      }
      // 5. Full Name
      else if (/full.*name|name/i.test(matchText) && !/company|employer|referrer/i.test(matchText)) {
        valueToFill = data.name;
      }
      // 6. LinkedIn URL
      else if (/linkedin/i.test(matchText)) {
        valueToFill = data.linkedinUrl || data.linkedin || '';
      }
      // 7. GitHub URL
      else if (/github/i.test(matchText)) {
        valueToFill = data.githubUrl || data.github || '';
      }
      // 8. Portfolio / Personal Website
      else if (/portfolio|website|homepage|site|blog/i.test(matchText) && !/company/i.test(matchText)) {
        valueToFill = data.portfolioUrl || data.portfolio || data.website || '';
      }
      // 9. Current Company / Employer
      else if (/current.*company|employer|present.*company/i.test(matchText)) {
        valueToFill = data.currentCompany || '';
      }
      // 10. Location / City
      else if (/city|location|address|residence/i.test(matchText)) {
        valueToFill = data.location || '';
      }

      // Fill values based on input type
      if (valueToFill) {
        if (input.tagName === 'SELECT') {
          // Attempt to match select options
          const options = Array.from(input.options);
          const matchedOption = options.find(opt => 
            opt.value.toLowerCase().includes(valueToFill.toLowerCase()) || 
            opt.text.toLowerCase().includes(valueToFill.toLowerCase())
          );
          if (matchedOption) {
            input.value = matchedOption.value;
            triggerEvents(input);
            count++;
          }
        } else if (input.type === 'checkbox' || input.type === 'radio') {
          // Checkboxes/radios logic
          if (valueToFill === 'true' || valueToFill === true || /yes|y/i.test(valueToFill)) {
            if (!input.checked) {
              input.checked = true;
              triggerEvents(input);
              count++;
            }
          }
        } else {
          // Regular text inputs and textareas
          input.value = valueToFill;
          triggerEvents(input);
          count++;
        }
      }
    });

    return count;
  }

  function getFirstName(fullName) {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  }

  function getLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) {
      return parts.slice(1).join(' ');
    }
    return '';
  }

  function triggerEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
})();
