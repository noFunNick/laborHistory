
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
  
    // Function to populate the day select box based on the selected month
    function populateDays(month) {
        const daysInMonth = new Date(2023, month, 0).getDate(); // Use a non-leap year for consistency
        daySelect.innerHTML = ''; // Clear existing options

        for (let day = 1; day <= daysInMonth; day++) {
            const dayOption = document.createElement('option');
            dayOption.value = day.toString().padStart(2, '0'); // Ensure two-digit format
            dayOption.textContent = day;
            daySelect.appendChild(dayOption);
        }
    }

    // Populate days when the page loads
    populateDays(monthSelect.value);

    // Update days when the month changes
    monthSelect.addEventListener('change', () => {
        populateDays(monthSelect.value);
    });
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-G4vIUZTqqJWDDKx0YqEAvJvDNlLztSlv5n5lTuVBVWwq_w7sIEmgWZDMBkowegsDffjPAPAFVH5m/pub?output=tsv'; 
    var todayDate = new Date();
    var today = todayDate.toISOString().split('T')[0]; // Format YYYY-MM-DD for comparison
    var todayNoYear = todayDate.toISOString().split('T')[0].slice(5);
    var yesteray = new Date(todayDate.getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Format YYYY-MM-DD for comparison
    var yesterayNoYear = new Date(todayDate.getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0].slice(5); // Format MM-DD for comparison
     // Format MM-DD for comparison
    // Function to fetch and parse CSV
    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            // parse tab separated values
            const rows = csvText.split('\n').map(row => row.split('\t'));
            // get today's events from rows
            const todayEvents = rows.filter(row => {
                const eventDate = row[0].trim(); // Assuming the date is in the first column
                return eventDate === todayNoYear; // Compare with today's date
            });
            const yesterdayEvents = rows.filter(row => {
                const eventDate = row[0].trim(); // Assuming the date is in the first column
                return eventDate === yesterayNoYear; // Compare with yesterday's date
            });

            displayEvents(todayEvents, yesterdayEvents, -1); // Display today's events
        })
        .catch(error => console.error('Error fetching CSV:', error));

    // Function to display events in the DOM
    function renderMap(latitude, longitude, containerId, eventTitle, eventDescription) {
        mapboxgl.accessToken = 'pk.eyJ1IjoibjRzd2FydHoiLCJhIjoiY2pvZHQ4MXQwMTFzaTNwbjI5cHoyNnd1YiJ9.wd0vkQXaXG0UC05AvmmlUA';
        const map = new mapboxgl.Map({
        container: containerId, // container ID
        center: [longitude, latitude], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 12 // starting zoom
    });
    var geoJson = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                longitude,
                latitude
              ]
            },
            "properties": {
              "Event Name": eventTitle,
              "Description": eventDescription,
            }
          }]
        };
    map.on('load', () => {
        // Add a marker to the map at the specified coordinates
        const marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
        // Add a popup to the marker with the event title and description
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${eventTitle}</h3><p>${eventDescription}</p>`)
            .setMaxWidth("300px")
            .addTo(map);
        // Set the popup to open on marker click
        marker.setPopup(popup); // sets a popup on this marker
    })
    }
    document.getElementById('submit-date').addEventListener('click', function() {
        const selectedMonth = monthSelect.value;
        const selectedDay = daySelect.value;
        const selectedDate = `${selectedMonth}-${selectedDay}`; // Format MM-DD for comparison

        fetch(csvUrl)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n').map(row => row.split('\t'));
                const customEvent = rows.filter(row => {
                    const eventDate = row[0].trim(); // Assuming the date is in the first column
                    return eventDate === selectedDate; // Compare with selected date
                });
                displayEvents(-1, -1, customEvent); // Display today's events
            })
            .catch(error => console.error('Error fetching CSV:', error));
    })
    function displayEvents(data, yesterday, custom) {
        
        const eventsContainer = document.getElementById('events-container');
        if(data !== -1 && yesterday !== -1) {
        data.forEach((row, index) => {
            var date = row[0].trim(); // Assuming the date is in the first column
            var year = row[1].trim(); // Assuming the year is in the second column
            var title = row[2].trim(); // Assuming the title is in the fourth column
            var latitude = row[3].trim(); // Assuming the latitude is in the fifth column
            var longitude = row[4].trim(); // Assuming the longitude is in the sixth column
            var description = row[5].trim(); // Assuming the description is in the seventh column
            var links = row[6].trim(); // Assuming the links are in the eighth column
            var imageUrl = row[7].trim(); // Assuming the image URL is in the ninth column
            var quote = row[8].trim(); // Assuming the quote is in the tenth column
            var category = row[10].trim(); // Assuming the category is in the third column
            var tags = row[11].trim(); // Assuming the tags are in the third column

            var mapTitle = 'todayMap' + index.toString();
            // const [date, title, description, imageUrl] = row;

            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `
                <h2>Today's Events</h2>
                <h2>${title}</h2>
                <p><strong>Date:</strong> ${date}</p>
                <p>${description}</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width: 50%; height: auto; border-radius: 5px;">` : ''}
                <div id=${mapTitle} style="width: 60%; height: 400px;"></div
                <p><strong></strong>${quote}</p>
            `;
            eventsContainer.appendChild(eventDiv);
            renderMap(latitude, longitude, mapTitle, title, description); // Render map for today's event
        });
        const yesterdayContainer = document.getElementById('yesterday-container');
        if (yesterdayContainer) {
            yesterday.forEach((row, index) => {
                var date = row[0].trim(); // Assuming the date is in the first column
                var year = row[1].trim(); // Assuming the year is in the second column
                var title = row[2].trim(); // Assuming the title is in the fourth column
                var latitude = row[3].trim(); // Assuming the latitude is in the fifth column
                var longitude = row[4].trim(); // Assuming the longitude is in the sixth column
                var description = row[5].trim(); // Assuming the description is in the seventh column
                var links = row[6].trim(); // Assuming the links are in the eighth column
                var imageUrl = row[7].trim(); // Assuming the image URL is in the ninth column
                var quote = row[8].trim(); // Assuming the quote is in the tenth column
                var category = row[10].trim(); // Assuming the category is in the third column
                var tags = row[11].trim(); // Assuming the tags are in the third column

                var mapTitle = 'Yestmap' + index.toString();
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerHTML = `
                    <h2>Yesterday's Events</h2>
                    <h2>${title}</h2>
                    <p><strong>Date:</strong> ${date}</p>
                    <p>${description}</p>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width: 50%; height: auto; border-radius: 5px;">` : ''}
                    <div id=${mapTitle} style="width: 60%; height: 400px;"></div>
                    <p><strong></strong>${quote}</p>

                `;
                yesterdayContainer.appendChild(eventDiv);
                renderMap(latitude, longitude, mapTitle, title, description); // Render map for today's event
            });
        } else {
            console.error('yesterday-container element not found in the DOM.');
        }
    }
    if (custom !== -1) {
        custom.forEach((row, index) => {
            var date = row[0].trim(); // Assuming the date is in the first column
            var year = row[1].trim(); // Assuming the year is in the second column
            var title = row[2].trim(); // Assuming the title is in the fourth column
            var latitude = row[3].trim(); // Assuming the latitude is in the fifth column
            var longitude = row[4].trim(); // Assuming the longitude is in the sixth column
            var description = row[5].trim(); // Assuming the description is in the seventh column
            var links = row[6].trim(); // Assuming the links are in the eighth column
            var imageUrl = row[7].trim(); // Assuming the image URL is in the ninth column
            var quote = row[8].trim(); // Assuming the quote is in the tenth column
            var category = row[10].trim(); // Assuming the category is in the third column
            var tags = row[11].trim(); // Assuming the tags are in the third column
            var mapTitle = 'customMap' + index.toString();
    
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerHTML = `
                <h2>${date}</h2>
                <h2>${title}</h2>
                <p><strong>Date:</strong> ${date}</p>
                <p>${description}</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width: 50%; height: auto; border-radius: 5px;">` : ''}
                <div id=${mapTitle} style="width: 60%; height: 400px;"></div>
                 <p><strongQuote>${quote}</strongQuote></p>

            `;
    
            // Prepend the custom event to the container
            eventsContainer.prepend(eventDiv);
    
            // Render the map for the custom event
            renderMap(latitude, longitude, mapTitle, title, description);
        });
    }
    }
});
function redirectToMap() {
    window.location.href = 'map.html'; // Replace 'map.html' with the path to your new HTML file
}
function redirectToHome() {
    window.location.href = 'index.html'; // Replace 'map.html' with the path to your new HTML file
}
function redirectToSearch() {
    window.location.href = 'search.html'; // Replace 'map.html' with the path to your new HTML file
}
function redirectToContact() {
    window.location.href = 'contact.html'; // Replace 'map.html' with the path to your new HTML file
}