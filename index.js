const express = require('express')
const SmartBuffer = require('smart-buffer').SmartBuffer;
const app = express()
app.use(express.text({type: '*/*'}))
const port = 80

app.get('*', (req, res) => {
  console.log('get');
  console.log(req.path);
  console.log(req.query);
  console.log(req.headers);
  if (req.path === '/game-on-line/default.asp') {
    res.send('KDLAB;104;0;0;0;0;0;password;0;0;0;A;10;10;200;10;2;1;Y;;;;;;;0;player;1;1;1;1;N;1;player2;1;1;1;1;N;BITRIX');
  } else {
    res.send('Hello World!')
  }
})

app.post('*', (req, res) => {
    console.log('post');
    console.log(req.path);
    console.log(req.query);
    console.log(req.headers);
    console.log(req.params);
    console.log(req.body);
    if (req.path === '/game-on-line/default.asp') {
    //   res.send('OK:KDLAB;104;0;0;0;0;0;password;0;0;0;A;0;0;0;0;1;0;Y;;;;;;;0;player;1;1;1;1;N;BITRIX');
    //   res.send(req.body);
        const data = req.body.split(';');
        if (data[3] === 6) {
            res.send('KDLAB;104;7;0;0;0;0;password;0;0;0;A;10;10;200;10;2;1;Y;;;;;;;0;player;1;1;1;1;N;1;player2;1;1;1;1;N;453#466#51#-1#421#310#51#-1#281#435#51#-1#323#589#51#-1#568#436#51#-1#599#366#50#-1#317#313#61#-1#384#500#51#-1#549#357#50#-1#350#392#51#-1;453#466#51#-1#421#310#51#-1#281#435#51#-1#323#589#51#-1#568#436#51#-1#599#366#50#-1#317#313#61#-1#384#500#51#-1#549#357#50#-1#350#392#51#-1;BITRIX');
        } else {
            res.send('OK:KDLAB');
        }
    // res.send('NEXT_MOVE');
    } else {
      res.send('Hello World!')
    }
  })
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
