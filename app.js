const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3300
const router = express.Router()

const boardRouter = require('./routers/board')

//body-parser 미들웨어
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

// board 라우터 -> /board/
app.use('/board', boardRouter)

app.listen(port, () => console.log(`Start Node At ${port}--------------------\n\n`))
