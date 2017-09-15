const express = require('express');
var fetch = require('node-fetch');

const app = express();

const port = process.env.PORT || 5000;

let dataset = fetch('https://itunes.apple.com/search?term=top+pop+hits&entity=track&limit=100').then(function(res) 
	{
		return res.json();
 	}).then(()=>{console.log(res.json());});

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
		this.bySong = new Map();
		this.artists = new Map();
		this.dSet = dSet;
	}

	getAllArtistNames()
	{
		let artistNames = new Set();

		for(let track of dSet.results)
		{
			artistNames.add();
		}

		return artistNames;
	}

	populate(dSet)
	{
		// for (let track of dSet.results)
		// {
		// 	bySong.put(track.trackName, track.artistName);
		// }
        //
		// let namesSet = getAllArtistNames();
        //
		// for(let name of namesSet)
		// {
		// 	artists.put(name, groupAllTracksFor(name));
		// }
	}

	groupAllTracksFor(artist)
	{
		// tracks = [];
		// for(let track of this.dSet.results)
		// {
		// 	if(track.artistName === artist)
		// 		tracks.push(track);
		// }
        //
		// return tracks;
		return [];
	}
}

class Artist
{
	constructor(aName, tracks)
	{
		this.aName = aName;
		this.tracks = [];
	}
}

let tManager = new TrackManager(dataset);
tManager.populate(dataset);

app.get('/', (req, res)=>
{
	res.send('Hello World!');
});

app.listen(port);



