<template>
  <div id="app">
    <header>
      <navigation />
      <dashboard v-if="isAuthenticated"/>
    </header>
    <b-container fluid>
      <flash-message class="flash-message"></flash-message>
      <b-row>
        <b-col auto>
          <section id="content">
            <router-view />
          </section>
        </b-col>
        <b-col v-if="$route.meta.sidebar" md="4">
          <aside>
            <router-view name="sidebar"/>
          </aside>
        </b-col>
      </b-row>
    </b-container>
    <footer><counter /></footer>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import { AUTH_LOGOUT, AUTH_CHECKAUTH_REQUEST } from '../Store/auth/mutation-types'
import Navigation from './Navigation/Navigation.vue'
import Dashboard from './Dashboard/Dashboard.vue'
import Counter from './Counter/Counter.vue'
import callApi from '../Api/callApi'

export default {
  name: 'app',
  components: {
    Navigation,
    Dashboard,
    Counter
  },
  created() {
    window.addEventListener('beforeunload', this.unload)
    this.$store.dispatch('AUTH_CHECKAUTH_REQUEST')
    .then((response) => {
      console.log('IDENTIFY_USER', this.getProfile.username)
      this.$socket.emit('IDENTIFY_USER', this.getProfile.username)
    }, (error) => {
      console.log("Une erreur est survenue au chargement de l'application.")
    })
  },
  methods: {
    setAxiosAuthorization() {
      if (this.token && this.token !== '') {
        callApi.defaults.headers.common['Authorization'] = this.token
      }
    },
    unload(event) {
      event.preventDefault()
      if (this.token) {
        this.$socket.emit('AUTH_LOGOUT', {username: this.getProfile.username})
        this.$store.dispatch(CHAT_CLOSE_ALLROOMS)
        this.$store.dispatch(AUTH_LOGOUT, this.getProfile.username)
      }
    }
  },
  computed: {
    ...mapGetters([
      'getProfile',
      'isAuthenticated'
    ]),
    ...mapState({
      token: state => state.auth.token
    })
  },
  sockets: {
    NOTIFICATION_RECEIVE: function(data) {
      console.log('NOTIFICATION_RECEIVE', data)
    }
  },
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.flash-message {
  margin-top: 10px;
}
</style>
