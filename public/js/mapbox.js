/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJpc2hlay1tYXBib3giLCJhIjoiY2x2aWdmN25zMWJ0aDJxbnZsd3Z5em9ubCJ9.cRjDmRT-At2epM6NNALQqQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/abishek-mapbox/clvihhx87018u01qz2byran6x',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Add Marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });

}


