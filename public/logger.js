function sendLogToBucket(bucketId, logData) {
  const baseUrl = '' // TODO override possible
  const url = `${baseUrl}b/${bucketId}`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('Log sent successfully');
  })
  .catch(error => {
    console.error('Failed to send log, storing locally', error);
    storeLogLocally(bucketId, logData);
  });
}

function storeLogLocally(bucketId, logData) {
  const logsKey = `logs_${bucketId}`;
  const existingLogs = localStorage.getItem(logsKey);
  const logs = existingLogs ? JSON.parse(existingLogs) : [];
  logs.push(logData);
  localStorage.setItem(logsKey, JSON.stringify(logs));
  attemptSyncLater(bucketId);
}

function attemptSyncLater(bucketId) {
  // Simple retry mechanism using setTimeout. Adjust timing and retry logic as needed.
  setTimeout(() => {
    syncLocalLogs(bucketId);
  }, 5000); // Retry after 5 seconds
}

function syncLocalLogs(bucketId) {
  const logsKey = `logs_${bucketId}`;
  const logs = JSON.parse(localStorage.getItem(logsKey) || '[]');

  if (logs.length === 0) {
    console.log('No local logs to sync');
    return;
  }

  logs.forEach((logData, index) => {
    const baseUrl = '' // TODO override possible
    fetch(`${baseUrl}b/${bucketId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    })
    .then(response => {
      if (response.ok) {
        logs.splice(index, 1); // Remove successfully synced log
        localStorage.setItem(logsKey, JSON.stringify(logs)); // Update local storage
        console.log('Local log synced successfully');
      } else {
        throw new Error('Failed to sync log');
      }
    })
    .catch(error => {
      console.error('Error syncing local logs, will retry later', error);
      // The retry mechanism will trigger again since the log remains in local storage.
    });
  });
}

async function getLogsFromBucket (bucketId) {
  const baseUrl = '' // TODO override possible
  const url = `${baseUrl}b/${bucketId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // console.log('Logs received:', data);
    return data.data;
    // TODO use the logs as needed
  } catch (error) {
    console.error('Failed to get logs', error);
  }
}

export { sendLogToBucket, getLogsFromBucket }
