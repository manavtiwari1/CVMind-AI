document.addEventListener('DOMContentLoaded', function () {
  const syncBtn = document.getElementById('sync-btn');
  const syncStatus = document.getElementById('sync-status');
  const profileDetails = document.getElementById('profile-details');
  const nameVal = document.getElementById('candidate-name');
  const emailVal = document.getElementById('candidate-email');
  const expVal = document.getElementById('candidate-exp');

  // Load existing profile from storage
  chrome.storage.local.get(['cvmind_profile'], function (result) {
    if (result && result.cvmind_profile) {
      displayProfile(result.cvmind_profile);
      syncStatus.className = 'status-box success';
      syncStatus.textContent = 'Profile synced successfully!';
    }
  });

  syncBtn.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || tabs.length === 0) {
        showError('No active tab found.');
        return;
      }

      const activeTab = tabs[0];
      
      // Inject scripting to get data from local storage
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          try {
            const userStr = localStorage.getItem('cvmind_user');
            if (userStr) return userStr;
            
            // Fallback: try searching DOM for text if localstorage is empty
            return null;
          } catch (e) {
            return null;
          }
        }
      }, function (results) {
        if (chrome.runtime.lastError) {
          showError('Cannot access this page. Please open your CVmind website tab.');
          return;
        }

        if (results && results[0] && results[0].result) {
          try {
            const profile = JSON.parse(results[0].result);
            if (profile && (profile.email || profile.name)) {
              chrome.storage.local.set({ cvmind_profile: profile }, function () {
                displayProfile(profile);
                syncStatus.className = 'status-box success';
                syncStatus.textContent = 'Profile synced successfully!';
              });
            } else {
              showError('No profile details found. Please login on the CVmind website.');
            }
          } catch (e) {
            showError('Failed to parse profile details.');
          }
        } else {
          showError('CVmind session not found. Please log in to the dashboard first.');
        }
      });
    });
  });

  function displayProfile(profile) {
    nameVal.textContent = profile.name || 'N/A';
    emailVal.textContent = profile.email || 'N/A';
    
    // Check if user has skills/exp text or extract it from properties
    const experience = profile.experienceLevel || profile.experience || 'Not configured';
    expVal.textContent = experience;

    profileDetails.classList.remove('hidden');
  }

  function showError(msg) {
    syncStatus.className = 'status-box empty';
    syncStatus.textContent = msg;
    profileDetails.classList.add('hidden');
  }
});
