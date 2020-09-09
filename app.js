'use strict'

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const VkBot = require('node-vk-bot-api')
const config = require('./config/')
var mysql = require('mysql')
const app = express()

app.use(bodyParser.json({ urlencoded: true }))
const server= app.listen(config.port, () => { console.log(`[Внимание]: Сервер работает на порту: ${config.port}`) })

const bot = new VkBot(config.vk.api)
bot.start()

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/
bot.use((ctx, next) => {
  if(ctx.message.peer_id !== 2000000001) return console.log('[Внимание]: Произошла попытка запроса с другой беседы')
  next()
})

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/
var con = mysql.createConnection({ host: `${config.db.host}`, user: `${config.db.user}`, password: `${config.db.password}`, database: `${config.db.database}` })
con.connect(function(err) {
  if (err) return console.log('[Внимание]: Подключение к базе данных проишло неуспешно');
  console.log('[Внимание]: Подключение к базе данных успешно')
  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  */
  require('./utils/commands.js')(bot, con, mysql)
  bot.startPolling()
})

process.on('SIGTERM', () => {
  console.info('[Внимание]: SIGTERM signal received.');
  console.log('[Внимание]: Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
    con.end();
  });
});
