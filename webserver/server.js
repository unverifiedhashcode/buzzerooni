let players = []
let queue = []

const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

//QUEUE MODIFICATION
//todo: queue reads NAME now but later it will need to assign each player with a time.
app.post('/buzz',(req,res)=> {
    const playerInQueue = queue.find(p => p.name === req.body.playerName);
    //todo: calculate latency and put their actual spot
    if (!playerInQueue){
        queue.push({'name':req.body.playerName,'submitTime':0});
        res.json({success:true})
    } else{
        //todo: perhaps some logic here about a player already being in the queue.
        res.json({ success: true });
    }
})

app.get('/readQueue',(req,res) => {
    res.json(queue);
})


//ADMIN CONTROLS
app.get('/',(req,res)=> {
    res.send('home screen. nothing here!');
})

app.post('/createPlayer',(req, res)=> {
    players.push({'name': req.body.playerName, 'score':0});
    res.json({success:true})
})

app.post('/removePlayer',(req, res)=> {
    players = players.filter(p => p.name !== req.body.playerName);
    res.json({success:true})
})

app.post('/modifyScore', (req, res) => {
    const player = players.find(p => p.name === req.body.playerName);
    if (player) {
        player.score += req.body.scoreChange;
        res.json({ success: true });
    }
    else{
        res.json({ success: false });
    }
});

//APP SETUP
app.get('/getPlayers',(req,res) => {
    res.json(players);
})

app.listen(port, () => {
    console.log('Server running on port 3000')
})