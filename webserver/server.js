let players = []

const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

//ADMIN CONTROLS
app.get('/',(req,res)=> {
    res.send('hello world');
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