var fetch = require('node-fetch');

fetch("localhost:5000/artists/:aName/tracks/:trackName",
    {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"artistName": "Katy Perry", "trackName": "Roar"})
    })
    .then(function(res){console.log('success')});