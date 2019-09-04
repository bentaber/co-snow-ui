Vue.component('data-table', {
  props: {
    sites: Array,
    date: Date
  },
  template: `
    <table>
      <thead>
        <tr>
          <th class="station-name">SNOTEL Station Name<small>{{displayDate}}</small></th>
          <th>County</th>
          <th class="numeric">Elevation<small>(ft)</small></th>
          <th class="numeric">Snow Depth<small>(in)</small></th>
        </tr>
      </thead>
      <tbody>
        <data-table-row 
          v-for="site in sites"
          v-bind:key="site.properties.stationId"
          v-bind:site="site.properties"
        ></data-table-row>
      </tbody>
    </table>
  `,
  computed: {
    displayDate: function() {
      let d = new Date(this.date);
      d.setMinutes(d.getMinutes()+d.getTimezoneOffset());
      return d.toDateString().substr(4);
    }
  }
});

Vue.component('data-table-row', {
  props: ['site'],
  template: `
    <tr>
      <!--<td>{{ site.stationId }}</td>-->
      <td class="station-name">{{ site.name }}</td>
      <td>{{ site.county }}</td>
      <td class="numeric">{{ displayElevation }}</td>
      <td class="numeric">{{ site.snow }}</td>
    </tr>
  `,
  computed: {
    displayElevation: function() {
      // never > 5 digits so don't have to think too hard
      return String(this.site.elevation).replace(/(\d)(\d{3})$/, "$1,$2");
    }
  }
});

// wondering if the v-bind:key is going to need to bind to stationId + date? maybe?
