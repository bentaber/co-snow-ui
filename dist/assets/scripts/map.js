
// easiest data structure
// lookup by date, then by id... or do you just want the whole geojson foreach date

// should date and the play controls be part of one big map control?

function map(el, baseURL) {
  const startDate = new Date("2018-10-01");
  const maxDate = new Date("2019-07-01");
  const baseDelay = 1000;
  
  let currentDate = new Date(startDate);
  let delay = baseDelay;
  let direction = 1;
  let map, vueMap;
  let isPaused = false;
  let timeoutId = null;

  let lastColorPalette;

  mapboxgl.accessToken = "pk.eyJ1IjoiYmVudGFiZXIiLCJhIjoiY2swNWZhZ2F5M3BmNjNubWphdGc4djA5NCJ9.X0RIxfT6u2BGGy9XIL4dPQ";
  
  function dateFormat(date) {
    // YYYY-MM-DD
    return date.toISOString().split("T")[0];
  }
  
  function getDataURL() {
    return baseURL + dateFormat(currentDate);
  }
  
  function nextSnow() {
    if (isPaused) {
      return;
    }
  
    timeoutId = setTimeout(() => {
      // wow, this is dumb, VUE doesn't notice changes to dates but does notice if you set a new Date
      currentDate = new Date(currentDate.setDate(currentDate.getDate()+direction));

      // is this going to be reactive? probs not
      if (currentDate > maxDate && 1 === direction) {
        currentDate = new Date(startDate);
      }
      else if (currentDate < startDate && -1 === direction) {
        currentDate = new Date(maxDate);
      }
        
      // is this too lazy?  lots of room to improve performance over this approach
      map.getSource("snotel-snow").setData(getDataURL());
      map.once("sourcedata", () => {
        // updateDate();
        updateTable();
        nextSnow();
      });
      
    }, delay);
  }

  function updateTable() {
    let sites = map.queryRenderedFeatures({ layers: ["snotel-sites"] });
  
    sites = sites.sort(function(a,b) {
      return b.properties.snow - a.properties.snow;
    }).slice(0,10);

    vueMap.sites = sites;

    // so unnecessary.. WHY MOFO
    vueMap.date = currentDate;
  }

  function registerMapEventHandlers() {
    
    map.on("load", () => {
      //constrain to Colorado
      map.setMaxBounds(map.getBounds());
      
      map.addSource("snotel-snow", {
        type: "geojson",
        data: getDataURL(currentDate)
      });
    
      map.addLayer({
        id: "snowfall",
        type: "heatmap",
        source: "snotel-snow",
        paint: {
          // Increase the heatmap weight based on snow magnitude
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "snow"],
            0, 0,
            215, 1 // 215 inches = full weight for now
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 1,
            12, 5
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0.0, "rgba(33,102,172,0)",
            0.2, "#81A1C1",
            0.4, "rgb(209,229,240)",
            0.6, "#fff",
            1.0, "#B48EAD",
            // 1.0, "rgb(33,102,172)"
          ],
          "heatmap-opacity": .75,
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 2,
            6, 35,
            9, 200
          ],
        }
      }, "waterway-label");
      
      map.addLayer({
        id: "snotel-sites",
        type: "symbol",
        source: "snotel-snow",
        layout: {
          "icon-image": "mountain-15",
          "text-field": "{name}",
          "text-size": 11,
          "text-offset": [0, 1],
          "text-anchor": "top"
        }
      });
    });
    
    map.on("load", () => {
      console.log('map load!');
      map.on("zoomend", updateTable);
      map.on("moveend", updateTable);
      map.once("sourcedata", () => {
        nextSnow();
      });
    });
  }

  vueMap = new Vue({
    el: el,
    data: {
      date: currentDate,
      sites: []
    },
    methods: {
      play: function(speed, dir) {
        if (speed && dir) {
          direction = dir;
          delay = baseDelay / speed;
        }
        
        if (isPaused) {
          isPaused = false;
          nextSnow();
        }
      },
      pause: function() {
        clearTimeout(timeoutId);
        isPaused = true;
      },
      swapColors: function() {
        var cp = map.getPaintProperty("snowfall", "heatmap-color");
        map.setPaintProperty("snowfall", "heatmap-color", lastColorPalette);
        lastColorPalette = cp;
      }
    },
    mounted: function() {
      map = new mapboxgl.Map({
        container: document.getElementById("map"),
        style: "mapbox://styles/mapbox/light-v10",
        center: [-105.552, 39.0311],
        zoom: 6,
        minZoom: 5.5,
        maxZoom: 12
      });
      registerMapEventHandlers();
    }
  });
}
