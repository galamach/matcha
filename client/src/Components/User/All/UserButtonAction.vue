<template>
  <b-button
    @click.prevent="onClick"
  >{{value}}</b-button>
</template>

<script>
  import { AUTH_RELATION_REQUEST } from '../../../Store/auth/mutation-types'

  export default {
    props: ['type', 'actor', 'receptor'],
    methods: {
      onClick() {
        switch(this.type) {
          case 'like':
          case 'unlike':
            this.$store.dispatch(AUTH_RELATION_REQUEST, this.data)
            .then((response) => {
              console.log(AUTH_RELATION_REQUEST, response.data)
              if (response.data.success) {
                console.log('emit AUTH_RELATION', response.data.data)
                this.$socket.emit('AUTH_RELATION', response.data.data)
              }
            }, (error) => {
                console.log("UserButtonAction click Error", error)
            })
          break
          default:
            console.log("onClick: no action")
          break
        }
      }
    },
    computed: {
      data() {
        return {
          action: this.type,
          actor: this.actor,
          receptor: this.receptor
        }
      },
      value() {
        switch(this.type) {
          case 'like':
            return 'Like'
          break
          case 'unlike':
            return 'Unlike'
          break
          default:
            return 'No action'
          break
        }
      }
    }
  }
</script>
