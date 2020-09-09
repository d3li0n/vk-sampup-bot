var geoip = require('geoip-lite')

module.exports = (bot, con, mysql) => {
  bot.command('/info', (ctx) => {
    const getUser = async (userId) => {
      const response = await bot.execute('users.get', {
        user_ids: userId,
      })
      return response[0].first_name + ' ' + response[0].last_name
    }
    getUser(ctx.message.from_id).then(res => ctx.reply(`❗ @id${ctx.message.from_id}(${res}) судя по всему, если я тебе ответил, то я работаю.`))
  })

  bot.command('/commands', (ctx) => {
    ctx.reply(`❗ Список моих команд:<br><br>` +
              `/info - Проверить мое состояние<br>` +
              `/commands - Список моих команд<br>` +
              `/ips {ip} - Список всех аккаунтов на айпи адресе<br>` +
              `/player {nickname|id} [1|Пусто] - Узнать основную информацию про игрока, третий параметр обязателен если идет поиск по нику, если по айди, можно оставить пустой`)
  })

  bot.command('/ips', (ctx) => {
    var text = (ctx.message.text).split(" ")
    if(text.length === 1) return ctx.reply(`❗ Введи нормальные параметры, бро`)
    else {
      const query = `SELECT COUNT(\`id\`) as total FROM sessions WHERE \`ip\` = ${mysql.escape(text[1])}`
      try {
        const getIp = async (query) => {
          await con.query(query, function (err, result, fields) {

            const query = `SELECT sessions.user_id, accounts.nickname, accounts.balance FROM sessions JOIN accounts ON accounts.id = sessions.user_id WHERE \`ip\` = ${mysql.escape(text[1])}`
            const getIpMult = async (query) => {
              try {
                await con.query(query, function (err, res, fields) {
                  var data = `❗ Количество аккаунтов на данном IP: ${result[0].total} <br>Мультиаккаунты: <br><br>`
                  var acc = 1
                  for(var i = 0; i < res.length; i++) data += `  ${acc++}. ${res[i].nickname}(#${res[i].user_id}) - ${res[i].balance} ₽ <br>`
                  var geo = geoip.lookup(text[1])
                  ctx.reply(data + `<br>Дополнительная информация об айпи адресе:<br><br> Страна: ${geo.country}<br>Регион: ${geo.region}<br>Таймзона: ${geo.timezone}<br>Город: ${geo.city}`)
                })
              }
              catch(e) {
                ctx.reply(`❗ Я не смог найти мультиаккаунты в своей записной книжке`)
              }
            }
            getIpMult(query)

          })
        }
        getIp(query)
      } catch(e) {
        ctx.reply(`❗ Я не смог найти мультиаккаунты в своей записной книжке`)
      }
    }
  })

  bot.command('/player', (ctx) => {
    var text = (ctx.message.text).split(" ")

    if(text.length === 1) return ctx.reply(`❗ Введи нормальные параметры, бро`)
    else {
      if(parseInt(text[2]) === 1) {
        const query = `SELECT accounts.id, accounts.nickname, accounts.email, accounts.balance, accounts.avatar_url, accounts.promo_id, sessions.ip FROM accounts JOIN sessions ON accounts.id = sessions.user_id WHERE \`nickname\` = ${mysql.escape(text[1])}`
        try {
          con.query(query, function (err, result, fields) {
            if(result[0] === undefined) return ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)
            if(err) return ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)

            const query = `SELECT COUNT(\`id\`) as total FROM sessions WHERE \`ip\` = ${mysql.escape(result[0].ip)}`
            con.query(query, function (err, res, fields) {
              return ctx.reply(`❗ Секундочку, провожу поиск в своей записной книжке информацию по айди игроку #${result[0].id}<br><br>` +
                        `🤠 Ник: ${result[0].nickname} (#${result[0].id})<br>` +
                        `💬 Почта: ` + ((result[0].email !== null) ? `${result[0].email}` : `НЕТ`) + `<br>` +
                        `🤑 Состояние счета: ${result[0].balance} ₽<br>` +
                        `🤖 Аватарка: ${result[0].avatar_url} <br>` +
                        `♻ Промокод: ` + ((result[0].promo_id !== null) ? `#${result[0].promo_id}` : `НЕТ`) + `<br>` +
                        `🤖 IP Игрока: ${result[0].ip} <br>` +
                        `🤖 Всего аккаунтов: ${res[0].total} <br>`)
            })
          })
        } catch(e) {
          ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)
        }
      }
      else {
        if(parseInt(text[1]) <= 0) return ctx.reply('Ошибочка, число должно быть больше нуля')

        const query = `SELECT accounts.id, accounts.nickname, accounts.email, accounts.balance, accounts.avatar_url, accounts.promo_id, sessions.ip FROM accounts JOIN sessions ON accounts.id = sessions.user_id WHERE accounts.id = ${mysql.escape(text[1])}`
        try {
          con.query(query, function (err, result, fields) {
            if(result[0] === undefined) return ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)
            if(err) return ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)
            const query = `SELECT COUNT(\`id\`) as total FROM sessions WHERE \`ip\` = ${mysql.escape(result[0].ip)}`
            con.query(query, function (err, res, fields) {
              return ctx.reply(`❗ Секундочку, провожу поиск в своей записной книжке информацию по айди игроку #${text[1]}<br><br>` +
                        `🤠 Ник: ${result[0].nickname} (#${result[0].id})<br>` +
                        `💬 Почта: ` + ((result[0].email !== null) ? `${result[0].email}` : `НЕТ`) + `<br>` +
                        `🤑 Состояние счета: ${result[0].balance} ₽<br>` +
                        `🤖 Аватарка: ${result[0].avatar_url} <br>` +
                        `♻ Промокод: ` + ((result[0].promo_id !== null) ? `#${result[0].promo_id}` : `НЕТ`) + `<br>` +
                        `🤖 IP Игрока: ${result[0].ip} <br>` +
                        `🤖 Всего аккаунтов: ${res[0].total} <br>`)
            })
          })
        } catch(e) {
          ctx.reply(`❗ Я не смог найти нужный аккаунт в своей записной книжке`)
        }
      }
    }
  })
}
