document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('monthTo');
    const daySelect = document.getElementById('dayTo');
    const monthFromSelect = document.getElementById('monthFrom');
    const dayFromSelect = document.getElementById('dayFrom');
    // Function to populate the day select box based on the selected month
    function populateDays(month, daySelector) {
        const daysInMonth = new Date(2023, month, 0).getDate(); // Use a non-leap year for consistency
        daySelector.innerHTML = ''; // Clear existing options

        for (let day = 1; day <= daysInMonth; day++) {
            const dayOption = document.createElement('option');
            dayOption.value = day.toString().padStart(2, '0'); // Ensure two-digit format
            dayOption.textContent = day;
            daySelector.appendChild(dayOption);
        }
    }

    // Populate days when the page loads
    populateDays(monthSelect.value, daySelect);
    populateDays(monthFromSelect.value, dayFromSelect);
    // Update days when the month changes
    monthSelect.addEventListener('change', () => {
        populateDays(monthSelect.value, daySelect);
    });
    monthFromSelect.addEventListener('change', () => {
        populateDays(monthFromSelect.value, dayFromSelect);
    });
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-G4vIUZTqqJWDDKx0YqEAvJvDNlLztSlv5n5lTuVBVWwq_w7sIEmgWZDMBkowegsDffjPAPAFVH5m/pub?output=tsv'; 
    // Function to fetch and parse CSV
    document.getElementById('submit-date').addEventListener('click', function() {
        const selectedMonthTo = monthSelect.value;
        const selectedDayTo = daySelect.value;
        const selectedDateTo = `${selectedMonthTo}-${selectedDayTo}`; // Format MM-DD for comparison
        const selectedMonthFrom = monthFromSelect.value;
        const selectedDayFrom = dayFromSelect.value;
        const selectedDateFrom = `${selectedMonthFrom}-${selectedDayFrom}`; // Format MM-DD for comparison
        fetch(csvUrl)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n').map(row => row.split('\t'));
                const data = rows.slice(1).map(row => ({
                    date: row[0],
                    event: row[1],
                    description: row[2],
                    latitude: parseFloat(row[3]),
                    longitude: parseFloat(row[4])
                }));
                const filteredEvents = data.filter(event => {
                    const eventDate = event.date.split('-').slice(0, 2).join('-'); // Get MM-DD part of the date
                    return eventDate >= selectedDateFrom && eventDate <= selectedDateTo;
                });



                renderMap(filteredEvents); // Display today's events
            })
            .catch(error => console.error('Error fetching CSV:', error));
    })

    // Function to display events in the DOM
    function renderMap(data) {
        const geoJson = {}
        geoJson.type = 'FeatureCollection';
        geoJson.features = [];
        for (let i = 0; i < data.length; i++) {
            const event = data[i];
            const feature = {
                type: 'Feature',
                properties: {
                    description: event.description,
                    event: event.event
                },
                geometry: {
                    type: 'Point',
                    coordinates: [event.longitude, event.latitude]
                }
            };
            geoJson.features.push(feature);
        }
        const mapContainer = document.getElementById('map-container');
        mapboxgl.accessToken = 'pk.eyJ1IjoibjRzd2FydHoiLCJhIjoiY2pvZHQ4MXQwMTFzaTNwbjI5cHoyNnd1YiJ9.wd0vkQXaXG0UC05AvmmlUA';
        const map = new mapboxgl.Map({
        container: 'map-container', // container ID
        center: [0,0], // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 5 // starting zoom
    });
    map.on('load', () => {
        map.addSource('events', {
            type: 'geojson',
            data: geoJson
        });
        map.addLayer({
            'id': 'events-layer',
            'type': 'circle',
            'source': 'events',
            'paint': {
                'circle-radius': 6,
                'circle-color': '#007cbf'
            }
        });
        // Add a popup to the map
        map.on('click', 'events-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const eventTitle = e.features[0].properties.event;
            // Ensure that if the map is zoomed out such that multiple
            // symbols are visible, the popup appears over the correct one.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<h3>${eventTitle}</h3><p>${description}</p>`)
                .addTo(map);
        });
        // Add a marker to the map at the specified coordinates
        // const marker = new mapboxgl.Marker()
        //     .setLngLat([longitude, latitude])
        //     .addTo(map);
        // // Add a popup to the marker with the event title and description
        // const popup = new mapboxgl.Popup({ offset: 25 })
        //     .setHTML(`<h3>${eventTitle}</h3><p>${eventDescription}</p>`)
        //     .setMaxWidth("300px")
        //     .addTo(map);
        // // Set the popup to open on marker click
        // marker.setPopup(popup); // sets a popup on this marker
    })
    
}
})
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
