const express = require('express')
const mysql_dbc = require('../db/mysql_con')()

const router = express.Router()
var con = mysql_dbc.init()

var res_result = require('../models/res_result')

var form_datetime = function(datetime) {
  return 'date_format(' + datetime + ', \'%Y-%m-%d %H:%i:%s\')'
}

/*
 전체 게시물 호출
  포스트 번호 역순으로 호출
  최대 20개 호출
  페이징: 마지막으로 불러온 포스트 번호 다음 20개를 호출
*/
router.get('/', (req, res, next) => {
  // mysql_dbc.open(con)

  var params = [req.body.p_no]

  var plus_paging_query = ''

  if (params[0] > 0) {
    plus_paging_query = 'p_no < ? && '
  }

  var show_board_query = 'SELECT p_no, p_title,' + form_datetime('p_date') + ' AS p_date, ' + form_datetime('p_modify_date') + ' AS p_modify_date FROM POST WHERE ' + plus_paging_query + 'p_is_delete = 0 ORDER BY p_no DESC LIMIT 20;'

  con.query(show_board_query, params, function(err, result, field) {
    // mysql_dbc.close(con)
    if (err) {
      res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
      throw err
    } else {
      res.send(new res_result(true, '전체 포스트 호출 성공', result))
      console.log(result)
    }
  })
})

// 특정 포스트 조회
router.get('/post/:p_no', (req, res, next) => {
  var params = [req.params.p_no]

  var show_post_query = 'SELECT p_no, p_title, p_contents, p_pwd, ' + form_datetime('p_date') + ' AS p_date, ' + form_datetime('p_modify_date') + ' AS p_modify_date FROM POST WHERE p_no = ?;'

  console.log(params[0] + '번 포스트 조회')
  con.query(show_post_query, params, function(err, result, field) {
    // mysql_dbc.close(con)
    if (err) {
      res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
      throw err
    } else {
      if (result.length > 0) {
        res.send(new res_result(true, params[0] + '번 포스트 조회 성공', result[0]))
        console.log(result)
      } else {
        res.send(new res_result(false, params[0] + '번 포스트 조회 실패, 존재하지 않은 포스트입니다.', null))
      }

    }
  })
})

router.post('/enroll', (req, res, next) => {
  console.log('포스트 등록')
  var params = [req.body.p_title, req.body.p_contents, req.body.p_pwd]
  var write_post_query = 'INSERT INTO POST (p_title, p_contents, p_pwd) VALUE (?, ?, ?);'

  con.query(write_post_query, params, function(err, result, field) {
    // mysql_dbc.close(con)
    if (err) {
      res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
      throw err
    } else {
      if (result.affectedRows == 1) {
        res.send(new res_result(true, '포스트 등록 성공', null))
        console.log(result)
      } else {
        res.send(new res_result(false, '포스트 등록 실패', null))
        console.log(result)
      }
    }
  })
})

router.put('/revise', (req, res, next) => {
  console.log('포스트 수정')
  var params = [req.body.p_contents, req.body.p_no]
  var update_post_query = 'UPDATE POST SET p_contents = ?, p_modify_date = date_format(NOW(), \'%Y-%m-%d %H:%i:%s\') WHERE p_no = ?;'

  con.beginTransaction(function(err) {
    if (err) {
      res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
      throw err
    }

    con.query(update_post_query, params, function(err, result, field) {
      // mysql_dbc.close(con)

      if (err) {
        con.rollback(function() {
          res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
          throw err
        })
      }

      con.commit(function(err) {

        if (err) {
          con.rollback(function() {
            res.send(new res_result(false, '포스트 수정 실패', null))
            console.log('commit err')
            throw err
          })
        }

        if (result.affectedRows == 1 && result.changedRows == params.length - 1) {
          res.send(new res_result(true, '포스트 수정 성공', null))
          console.log(result)
        } else {
          con.rollback(function() {
            res.send(new res_result(false, '포스트 수정 실패', null))
            console.log(result)
          })
        }
      })

    })
  })
})

router.post('/delete', (req, res, next) => {
  console.log('포스트 삭제')
  var params = [req.body.p_no, req.body.p_pwd]
  var delete_post_query = 'UPDATE POST SET p_title = ?, p_contents = ?, p_is_delete = ?, p_modify_date = date_format(NOW(), \'%Y-%m-%d %H:%i:%s\') WHERE p_no = ?;'
  var get_pwd_query = 'SELECT p_pwd FROM POST;'

  console.log('비번: ' + params[1])

  con.query(get_pwd_query, [params[0]], (err, result, field) => {
    if (err) {
      throw err
    }

    var compare_pwd = result[0].p_pwd

    console.log('가져온 값: ' + compare_pwd);

    if (compare_pwd == params[1]) {

      var delete_params = ['삭제', '삭제', 1, req.body.p_no]

      con.query(delete_post_query, delete_params, function(err, result, field) {
        // mysql_dbc.close(con)

        if (err) {
          con.rollback(function() {
            res.send(new res_result(false, 'MySQL 서버 에러: ' + err, null))
            throw err
          })
        }

        con.commit(function(err) {

          if (err) {
            con.rollback(function() {
              res.send(new res_result(false, '포스트 삭제 실패', null))
              console.log('commit err')
              throw err
            })
          }

          if (result.affectedRows == 1 && result.changedRows == params.length - 1) {
            res.send(new res_result(true, '포스트 삭제 성공', null))
            console.log(result)
          } else {
            con.rollback(function() {
              res.send(new res_result(false, '포스트 삭제 실패', null))
              console.log(result)
            })
          }
        })

      })

    } else {
      res.send(new res_result(false, '삭제 비밀번호 불일치', null))
    }
  })

})

module.exports = router

// get은 데이터 조회
// post는 데이터 생성(데이터 전송을 해줘서 저장)
// put은 데이터 생성 및 수정 -> post와 다른 것은 post는 반환값이 변할 수 있지만, put은 반환값이 일정해야한다.
// delete는 데이터 삭제
