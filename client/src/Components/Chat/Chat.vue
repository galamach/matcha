<template>
  <b-container>
    <b-row>
      <b-col>
        <RoomList />
      </b-col>
      <b-col>
        <UserList />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import RoomList from './ChatContent/RoomList.vue'
import UserList from './UserList/UserList.vue'
import { CHAT_WATCH_ALLROOMS, CHAT_UNWATCH_ALLROOMS } from '../../Store/chat/mutation-types'
import Vue from 'vue'
import store from '../../Store/store.js'
import { mapState, mapGetters } from 'vuex'

export default {
    components: {
      RoomList,
      UserList
    },
    beforeRouteEnter (to, from, next) {
      let rooms = store.getters.getRooms
      if (rooms) {
        rooms.forEach(r => {
          Vue.prototype.$socket.emit('CHAT_OPEN_ROOM', {
            room: {_id: r.data._id},
            usernames: r.usernames
          })
        })
        store.dispatch(CHAT_WATCH_ALLROOMS)
      }
      next()
    },
    beforeRouteLeave (to, from, next) {
      if (this.rooms) {
        this.rooms.forEach(r => {
          this.$socket.emit('CHAT_QUIT_ROOM', r.data._id)
        })
        store.dispatch(CHAT_UNWATCH_ALLROOMS)
      }
      next()
    },
    computed: {
      ...mapGetters([
        'isProfileLoaded'
      ]),
      ...mapState({
        success: state => state.room.status === 'success',
        username: state => isProfileLoaded ? state.auth.profile.username : '',
        rooms: state => state.chat.rooms
      })
    }
}
</script>
