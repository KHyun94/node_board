const mysql = require('mysql')
const config = require('./mysql_info').local

exports.module = function(){
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

      isCon:function(con){
        con.connect(function(err){
          if(err){
            console.error('mysql conn error : ' + err)
          } else {
            console.info('mysql conn successfully')
          }
        })
      },

      mysqlEnd:function(con){
        con.connect(function(err){
          if(err){
            console.errer('mysql conn error: ' + err)
          } else {
            console.info('mysql conn end start')
            con.end()
          }
        })
      }

  }



}
