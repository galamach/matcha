const ChatMessage = require('../../models/chat/message')
const ChatRoom = require('../../models/chat/room')
const roomController = require('./roomController')
const User = require('../../models/user')

module.exports = {
  getOne: function(id, callback) {
    ChatMessage.findById(id, function(err, message){
      if (err) {
        callback(err, null)
        return
      }
      if (!message) {
        callback(null, {
          success: 0,
          message: 'INEXISTANT MESSAGE'
        })
        return
      }
      callback(null, {
        success: 1,
        data: message
      })
    })
  },
  getAllByRoom: function(id, callback) {
    ChatMessage.find({room: id})
    .populate('user', 'username')
    .exec(function(err, messages) {
      if (err) {
        callback(err, null)
        return
      }
      callback(null, {
        success: 1,
        data: messages
      })
    })
  },
  create: function(body, callback) {
    User.findOne({username: body.username}, function(err, user) {
      if (err) {
        callback(err, null)
        return
      }
      let message = new ChatMessage({
        room: {_id: body.roomId},
        user: {_id: user._id},
        message: body.message
      })
      message.save(function(err, message) {
        if (err) {
          callback(err, null)
          return
        }
        callback(null, {
          success: 1,
          data: message
        })
      })
    })
  },
  update: function(body, callback) {
    ChatMessage.findById(body.id, function(err, message) {
      if (err) {
        callback(err, null)
        return
      }
      message.message = body.message
      message.save(function(err, message) {
        if (err) {
          callback(err, null)
          return
        }
        callback(null, {
          success: 1,
          data: message
        })
      })
    })
  },
  delete: function(id, callback) {
    ChatRoom.deleteOne({_id: id}, function(err) {
      if (err) {
        callback(err, null)
        return
      }
      callback(null, {
          success: 1
      })
    })
  }
}
