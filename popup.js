document.addEventListener("DOMContentLoaded", function () {
  const timelineInput = document.getElementById("timelineInput");
  const saveTimelineButton = document.getElementById("saveTimeline");
  const clearDataButton = document.getElementById("clearData");
  const timelineList = document.getElementById("timelineList");

  // Load saved timelines
  chrome.storage.sync.get("timelines", function (data) {
    if (data.timelines) {
      data.timelines.forEach(function (timeline) {
        const listItem = createTimelineListItem(timeline);
        timelineList.appendChild(listItem);
      });
    }
  });

  // Save button clicked
  saveTimelineButton.addEventListener("click", function () {
    const timeline = timelineInput.value.trim();
    if (timeline) {
      const timestamp = timeline;
      if (timestamp) {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const activeTab = tabs[0];
            if (
              activeTab &&
              activeTab.url.startsWith("https://www.youtube.com/watch")
            ) {
              let videoURL = activeTab.url;

              videoURL = videoURL.replace(
                /&t=\d+s|#t=\d+m\d+s|#t=\d+h\d+m\d+s$/,
                ""
              );

              const timestampInSeconds = parseTimestamp(timestamp);
              const timelineData = {
                name: timeline,
                url: videoURL,
                timestamp: timestampInSeconds,
              };

              chrome.storage.sync.get("timelines", function (data) {
                const timelines = data.timelines || [];
                timelines.push(timelineData);
                chrome.storage.sync.set({ timelines: timelines });

                // Create and Display new timeline list item
                const listItem = createTimelineListItem(timelineData);
                timelineList.appendChild(listItem);

                timelineInput.value = "";
              });
            } else {
              alert("Please open a Youtube video tab to save a timeline");
            }
          }
        );
      } else {
        alert("Please enter a timestamp.");
      }
    } else {
      alert("Please enter a timeline name.");
    }
  });

  // Clear data when button clicked
  clearDataButton.addEventListener("click", function () {
    chrome.storage.sync.remove("timelines", function () {
      timelineList.innerHTML = ""; // Clear timeline list
    });
  });

  function createTimelineListItem(timeline) {
    const listItem = document.createElement("li");

    // Create a div to hold the image and text side by side
    const contentContainer = document.createElement("div");
    contentContainer.style.display = "flex";
    contentContainer.style.gap = "8px";

    // Create the image element
    const img = document.createElement("img");
    img.src = "/images/more_than.png";
    img.width = "10";
    contentContainer.appendChild(img);

    // Create a span for the timeline
    const span = document.createElement("span");
    span.textContent = timeline.name;

    // Add a click event listener to open the saved video URL
    listItem.addEventListener("click", function () {
      openYoutubeURLWithTimestamp(timeline.url, timeline.timestamp);
    });

    contentContainer.appendChild(span);
    listItem.appendChild(contentContainer);
    return listItem;
  }

  function openYoutubeURLWithTimestamp(url, timestamp) {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    const timestampString = `#t=${minutes}m${seconds}s`;
    const videoURL = url + timestampString;
    chrome.tabs.create({ url: videoURL });
  }
  function parseTimestamp(timestamp) {
    const timeParts = timestamp.split(":");
    if (timeParts.length === 2) {
      const hours = 0;
      const minutes = parseInt(timeParts[0]);
      const seconds = parseInt(timeParts[1]);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (timeParts.length === 3) {
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const seconds = parseInt(timeParts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }
});
