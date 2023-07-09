import { useState, useEffect } from 'react';
import { generateAPIKey } from '../api/key';

import './tracks.scss';

const TracksPage = ({children}) => {

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(false);
    const [features, setFeatures] = useState([])
    const [apikey, setAPIKey] = useState(null);

    const [playlist, setPlaylist] = useState('2RFQAZRaFszApwIpB90dBd');

    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const [showIds, setShowIds] = useState(false);
    const [exactTempo, setExactTempo] = useState(false);
    const [normalizeMode, setNormalizeMode] = useState(false);
    const [normalizeTempo, setNormalizeTempo] = useState(false);

    const [sorting, setSorting] = useState(null)

    const [focusedTrack, setFocusedTrack] = useState(null);

    let keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    async function getTracks(off)
    {
        let key;
        if(!apikey)
        {
            key = await generateAPIKey()
            setAPIKey(key)
        } else { key = apikey; }
        const o = '2RFQAZRaFszApwIpB90dBd'
        const n = '0UP3CSptQ0RgWAAh4mz6P5'
        let url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?offset=${off}&limit=100&market=US&locale=en-US`
        return fetch(url, {
            headers: {
                'Authorization': `Bearer  ${key.access_token}`
            }
        }).then((res) => res.json()).then((data) => {return data}).catch((err) => console.log(err))
    }

    async function getAllTracks()
    {
        setLoading(true);
        setItems([]);
        setProgress(0);
        let data = await getTracks(0);
        let features = await getTracksInfo(data.items, 0);
        let tracks = horizontal_merge(data.items, features);
        let iterations = Math.ceil(data.total / 100) - 1;
        for(let i = 1; i <= iterations; i++)
        {
            let data_next = await getTracks(i * 100);
            let features_next = await getTracksInfo(data_next.items, 0);
            tracks = tracks.concat(horizontal_merge(data_next.items, features_next))
            setItems(tracks)
            setProgress(i / iterations)
        }
        setItems(tracks)
        setLoading(false)
    }

    function horizontal_merge(tracks, fts)
    {
        let merged = []
        for( let i = 0; i < tracks.length; i++ )
        {
            let features = fts.audio_features[i]
            merged.push({...tracks[i], features})
        }
        return merged
    }

    async function getTracksInfo(tracks, off = 0)
    {
        let key;
        if(!apikey)
        {
            key = await generateAPIKey()
            setAPIKey(key)
        } else { key = apikey; }

        let ids = []
        for( let i = off; i < tracks.length; i++ )
        {
            ids.push(tracks[i].track.id)
        }
        let url = `https://api.spotify.com/v1/audio-features?ids=${ids}`
        return fetch(url, {
            headers: {
                'Authorization': `Bearer  ${key.access_token}`
            }
        }).then((res) => res.json()).then((data) => {
            return data;
        }).catch((err) => console.log(err))
    }

    function tryFind()
    {
        fetch(`https://www.youtube.com/results?search_query=survive+space+laces+audio`).then((data) => data.text()).then((res) => console.log(res))
    }

    function sortBy(field)
    {
        console.log(field)
        let direction = 0;
        if(sorting === field) {
            setSorting(field + ' inv')
            direction = 0;
        }
        else {
            setSorting(field)
            direction = 1;
        }
        let sorted = [...items];
        switch(field)
        {
            case 'tempo':
                // first sort by key
                direction == 1 ? sorted.sort((a, b) => (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)) - (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length))) : sorted.sort((a, b) => (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length)) - (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)))
                if(normalizeTempo)
                {
                    direction == 1 ? sorted.sort((a, b) => (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo) - (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo)) : sorted.sort((a, b) => (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo) - (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo))
                } else {
                    direction == 1 ? sorted.sort((a, b) => a.features.tempo - b.features.tempo) : sorted.sort((a, b) => b.features.tempo - a.features.tempo)
                }
                break;
            case 'key':
                //first sort by tempo
                if(normalizeTempo)
                {
                    direction == 1 ? sorted.sort((a, b) => (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo) - (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo)) : sorted.sort((a, b) => (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo) - (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo))
                } else {
                    direction == 1 ? sorted.sort((a, b) => a.features.tempo - b.features.tempo) : sorted.sort((a, b) => b.features.tempo - a.features.tempo)
                }
                direction == 1 ? sorted.sort((a, b) => (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)) - (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length))) : sorted.sort((a, b) => (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length)) - (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)))
                break;
            case 'name':
                direction == 1 ? sorted.sort((a, b) => a.track.name.localeCompare(b.track.name)) : sorted.sort((a, b) => b.track.name.localeCompare(a.track.name))
                break;
            case 'artist':
                direction == 1 ? sorted.sort((a, b) => a.track.artists[0].name.localeCompare(b.track.artists[0].name)) : sorted.sort((a, b) => b.track.artists[0].name.localeCompare(a.track.artists[0].name))
        }
        setItems(sorted)
    }

    function jumpToTop(source)
    {
        source.ownerDocument.documentElement.scrollTop = 0;
    }

    return (
        <div className={'tracks'}>
            {children}
            <div className={'form'}>
                <input type="text" onChange={(e) => setPlaylist(e.target.value)} placeholder="playlist id"></input>
                <button onClick={() => getAllTracks()}>get tracks</button>
                <input type="checkbox" id="exactTempo" onChange={(e) => setExactTempo(e.target.checked)}></input>
                <label for="exactTempo">show exact tempo?</label>
                <input type="checkbox" id="normalizeMode" onChange={(e) => setNormalizeMode(e.target.checked)}></input>
                <label for="normalizeMode">normalize mode?</label>
                <input type="checkbox" id="normalizeTempo" onChange={(e) => setNormalizeTempo(e.target.checked)}></input>
                <label for="normalizeTempo">normalize tempo?</label>
                {loading && <progress value={progress} max={1}></progress>}
            </div>
            <div className={'track headers'}>
                <span onClick={() => sortBy('name')}>TITLE {sorting === 'name' ? '↾' : (sorting === 'name inv' ? '⇂' : '')}</span>
                <span onClick={() => sortBy('artist')}>ARTIST {sorting === 'artist' ? '↾' : (sorting === 'artist inv' ? '⇂' : '')} </span>
                <span onClick={() => sortBy('tempo')} title={normalizeTempo ? 'normalized' : null}>BPM {sorting === 'tempo' ? '↾' : (sorting === 'tempo inv' ? '⇂' : '')} {normalizeTempo ? '*' : ''}</span>
                <span onClick={() => sortBy('key')} title={normalizeMode ? 'normalized' : null}>KEY {sorting === 'key' ? '↾' : (sorting === 'key inv' ? '⇂' : '')} {normalizeMode ? '*' : ''}</span>
            </div>
            {items && items.map((item, index) => {
                return (<div className={'track' + (focusedTrack && focusedTrack.track.id === item.track.id ? ' focused' : '')} onClick={() => {focusedTrack && focusedTrack.track.id === item.track.id ? setFocusedTrack(null) : setFocusedTrack(item)}}>
                            <span className={'name'}>{item.track.name}&nbsp;&nbsp;<span className={'id'}>{item.track.id}</span></span>
                            <span className={'artists'}>{item.track.artists.map((artist, index) => {return (index > 0 ? ', ' : '') + artist.name})}</span>
                            {item.features && <span className={'tempo'}>{exactTempo ? (normalizeTempo && item.features.tempo < 90 ? item.features.tempo * 2 : item.features.tempo) : Math.round((normalizeTempo && item.features.tempo < 90 ? item.features.tempo * 2 : item.features.tempo) * 10) / 10}</span>}
                            {item.features && <span className={'key'}>{normalizeMode ? ((item.features.mode == 1 ? (keys[item.features.key]) : (keys[(item.features.key + 3) % keys.length])) + ' Major') : (keys[item.features.key] + ' ' + (item.features.mode == 1 ? 'Major' : 'Minor'))}</span>}
                            <span><a href={`https://www.youtube.com/results?search_query=${item.track.name.replaceAll(' ', '+') + '+' + item.track.artists[0].name.replaceAll(' ', '+')}+audio`}>.wav</a></span>
                        </div>)
            })}
            <button className={'jumptotop'} onClick={(e) => jumpToTop(e.target)}>↾</button>
        </div>
    )
}

export default TracksPage;
