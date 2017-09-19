const express = require('express');
var fetch = require('node-fetch');

const app = express();

const port = process.env.PORT || 5000;
let dataset;
/*
Computed Resources
- Average cost per minute in respect to each artist
- Percentage explicit tracks per artist
- Collection price vs sum of prices per track

Regulars
- Return all artists
- Return all tracks by an artist

Update
Update, add, or delete track from track list

Ask for song will ask itunes API for new one if not already in the cached database (baseline top 100)
delete will only delete from the cached database
*/



class TrackManager
{
	constructor(dSet)
	{
		// console.log(dSet);
		this.bySong = new Map();
		this.artists = new Map();
		this.dSet = dSet;
	}

    getArtists()
    {
    	let arts = [];
    	for(let artist of this.artists.values())
		{
			arts.push(artist);
		}

		return arts;
    }
    //
    // getAllArtists()
    // {
    //     let arts = [];
    //     for(let a of this.artists)
    //     {
    //         arts.push(a.aName);
    //     }
    //
    //     return arts;
    // }
    //
    // getAllArtistNames()
    // {
    //     let artistNames = new Set();
    //
    //     for(let track of this.dSet.results)
    //     {
    //         artistNames.add(track.artistName);
    //     }
    //
    //     return artistNames;
    // }

	populate()
	{
		let artistSet = new Set();

		for (let track of this.dSet.results)
		{
			this.bySong.set(track.trackName, track);
			artistSet.add(track.artistName);
		}

		for(let theArtist of artistSet)
		{
			this.artists.set(theArtist, new Artist(theArtist, this.groupAllTracksFor(theArtist)));
		}
	}

	groupAllTracksFor(artist)
	{
		let tracks = new Set();
		for(let track of this.dSet.results)
		{
			if(track.artistName === artist)
				tracks.add(track);
		}

		return Array.from(tracks);
	}

	addTrack(trackName, track)
	{
		this.bySong.set(trackName, track);
	}
}

class Artist
{
	constructor(aName, tList)
	{
		this.aName = aName;
		this.tList = tList;
	}
}

/*
Computed Resources
- Average cost per minute in respect to each artist
- Percentage explicit tracks per artist
- Collection price vs sum of prices per track
*/

let averageTrackPriceFor =  function (artist)
{
	let tracks = artist.tList;
	let duration = 0;
	let cost = 0;
	for(let track of tracks)
	{
		duration += track.trackTimeMillis/60000; //converting milliseconds to minutes
		cost += track.trackPrice;
	}

	return cost/duration;
};

let percentExplicit = function (artist)
{
    let tracks = artist.tList;
    let countExplicit = 0;
    for(let track of tracks)
	{
		//console.log(track.trackExplicitness);
		if(track.trackExplicitness === "explicit")
		{
			countExplicit++;
		}
	}
	return countExplicit/tracks.length*100;
};

let savings = function (response, track)
{
    fetch(`https://itunes.apple.com/lookup?id=${track.collectionId}&entity=song`).then(function(res)
    {
        return res.json();
    }).then(function(json)
    {
    	console.log(json);
        let collectionCost = json.results[0].collectionPrice;
        console.log(collectionCost);
        let sumPrice = 0;
        for(let track of json.results)
        {
            if(track.wrapperType === "track")
            {
                sumPrice += track.trackPrice;
            }
        }

        let difference = collectionCost - sumPrice;
        console.log(difference);

        if(difference < 0)
        {
            let retVal = "If you buy the album, you save: " + -difference.toFixed(2);
            console.log("========================="+retVal)
            response.send(retVal);
        }
        else
        {
            let retVal = "You save: " + difference.toFixed(2) + " by buying the songs individually";
            response.send(retVal);
        }
    });
};

let tManager;

let main = function main()
{
    fetch('https://itunes.apple.com/search?term=top+pop+hits&limit=100').then(function(res)
    {
        return res.json();
    }).then(function(json)
    {
        dataset = json;
        // console.log(dataset);
        tManager = new TrackManager(dataset);
        tManager.populate();
        //console.log(tManager.bySong);
    });
};

app.get('/', (req, res)=>
{
	res.send('Hello World!');
});

//============================================================================================
app.get('/artists', function(req, res)
{
    res.send(JSON.stringify(tManager.getArtists()));
});

app.get('/artists/:aName', function (req, res)
{
	let artistName = req.params.aName.replace(/_/gi," ");

	res.send(JSON.stringify(tManager.artists.get(artistName).tList));
});

app.get('/artists/:aName/average', function (req, res)
{
    let artistName = req.params.aName.replace(/_/gi," ");

	res.send("Average cost per minute is: $" + averageTrackPriceFor(tManager.artists.get(artistName)).toFixed(2));
});

app.get('/artists/:aName/explicit', function (req, res)
{
    let artistName = req.params.aName.replace(/_/gi," ");

    res.send("Percentage of Explicit tracks: " + percentExplicit(tManager.artists.get(artistName)).toFixed(2) + "%");
});

app.get('/artists/:aName/tracks/:tName/savings', function (req, res)
{
    let trackName = req.params.tName.replace(/_/gi," ");

	savings(res, tManager.bySong.get(trackName));
});

//============================================================================================

main();
app.listen(port);


