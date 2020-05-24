const mysql = require('mysql')
const config = require('../config/mysql_config').local

module.exports = function(){
  return{
      init: function () {
        return mysql.createConnection({
        host      : config.host,
        port      : config.port,
        user      : config.user,
        password  : config.password,
        database  : config.database
        })
      },
      open: function(con){
        con.connect(function(err){
          if(err){
            console.error('mysql conn error : ' + err)
          } else {
            console.log('mysql conn successfully')
          }
        })
      },
      re_open: function(con){
        con.connect()
      },

      close:function(con){
        con.end()
      }

  }



}
