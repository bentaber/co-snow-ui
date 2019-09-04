Vue.component('play-controls', {
  props: {
    date: Date
  },
  data: function() {
    return {
      speed: 1,
      lastSpeed: 1,
      maxSpeed: 8,
      direction: 1,
      swapCount: 0
    }
  },
  template: `
    <div class="controls">
      <span class="date">{{ displayDate }}</span>
      <div class="button-group">
        <button 
          v-if="swapCount%2==0"
          v-on:click="swapColors"
          class="material-icons-round">invert_colors</button>
        <button 
          v-if="swapCount%2==1"
          v-on:click="swapColors"
          class="material-icons-round">invert_colors_off</button>
      </div>
      <div class="button-group">
        <span class="speed">{{ displaySpeedReverse }}</span>
        <button 
          v-on:click="advance(-1)"
          class="material-icons-round disabled">fast_rewind</button>
        <button 
          v-if="speed>0"
          v-on:click="pause"
          class="material-icons-round">pause_circle_outline</button>
        <button
          v-if="speed===0"
          v-on:click="play"
          class="material-icons-round">play_circle_outline</button>
        <button 
          v-on:click="advance(1)"
          class="material-icons-round">fast_forward</button>
        <span class="speed">{{ displaySpeedForward }}</span>
      </div>
    </div>
  `,
  computed: {
    displayDate: function() {
      let d = new Date(this.date);
      d.setMinutes(d.getMinutes()+d.getTimezoneOffset());
      return d.toDateString().substr(4);
    },
    displaySpeedForward: function() {
      if (this.direction > 0) {
        return this.speed + 'x';
      }

      return "";
    },
    displaySpeedReverse: function() {
      if (this.direction < 0) {
        return this.speed + 'x';
      }

      return "";
    }
  },
  methods: {
    play: function() {
      this.speed = this.lastSpeed;
      this.$emit("play", this.speed, this.direction);
    },
    pause: function() {
      this.lastSpeed = this.speed;
      this.speed = 0;
      this.$emit("pause");
    },
    advance: function(dir) {
      if (dir == this.direction) {
        this.speed *= 2;
        if (this.speed > this.maxSpeed) {
          this.speed = 1;
        }
      }
      else {
        this.direction = dir;
        
        // start up if paused
        if (!this.speed) {
          this.speed = 1;
        }
      }
      
      this.lastSpeed = this.speed;
      this.play();          
    },
    swapColors: function() {
      this.swapCount ++;
      this.$emit("swap-colors");
    }
  }
});
