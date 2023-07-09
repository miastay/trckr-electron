import { useState, useEffect } from 'react';
import { generateAPIKey } from '../api/key';

import './tracks.scss';

const TracksPage = ({children}) => {

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(false);
    const [features, setFeatures] = useState([])
    const [apikey, setAPIKey] = useState(null);

    const [showIds, setShowIds] = useState(false);
    const [exactTempo, setExactTempo] = useState(false);
    const [normalizeMode, setNormalizeMode] = useState(false);
    const [normalizeTempo, setNormalizeTempo] = useState(false);

    const [sorting, setSorting] = useState(null)

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
        let url = `https://api.spotify.com/v1/playlists/${n}/tracks?offset=${off}&limit=100&market=US&locale=en-US`
        fetch(url, {
            headers: {
                'Authorization': `Bearer  ${key.access_token}`
            }
        }).then((res) => res.json()).then((data) => {console.log(data); let d = data.items; setItems(items.concat(data.items)); !total && setTotal(data.total)})
    }

    async function getTracksInfo(off = 0)
    {
        let key;
        if(!apikey)
        {
            key = await generateAPIKey()
            setAPIKey(key)
        } else { key = apikey; }

        let ids = []
        for( let i = off; i < items.length; i++ )
        {
            console.log(items[i])
            ids.push(items[i].track.id)
        }
        console.log(ids)
        let url = `https://api.spotify.com/v1/audio-features?ids=${ids}`
        fetch(url, {
            headers: {
                'Authorization': `Bearer  ${key.access_token}`
            }
        }).then((res) => res.json()).then((data) => {
            let updatedTracks = []
            for( let i = off; i < items.length; i++ )
            {
                let features = data.audio_features[i]
                updatedTracks.push({...items[i], features})
            }
            console.log(updatedTracks)
            setItems(updatedTracks)
            // console.log(data); setFeatures(features.concat(data.audio_features))
        })
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
                if(normalizeTempo)
                {
                    direction == 1 ? sorted.sort((a, b) => (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo) - (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo)) : sorted.sort((a, b) => (b.features.tempo < 90 ? b.features.tempo * 2 : b.features.tempo) - (a.features.tempo < 90 ? a.features.tempo * 2 : a.features.tempo))
                } else {
                    direction == 1 ? sorted.sort((a, b) => a.features.tempo - b.features.tempo) : sorted.sort((a, b) => b.features.tempo - a.features.tempo)
                }
                break;
            case 'key':
                direction == 1 ? sorted.sort((a, b) => (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)) - (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length))) : sorted.sort((a, b) => (b.features.mode == 1 ? (b.features.key) : ((b.features.key + 3) % keys.length)) - (a.features.mode == 1 ? (a.features.key) : ((a.features.key + 3) % keys.length)))
                break;
            case 'name':
                direction == 1 ? sorted.sort((a, b) => a.track.name.localeCompare(b.track.name)) : sorted.sort((a, b) => b.track.name.localeCompare(a.track.name))
        }
        setItems(sorted)
    }

    return (
        <div className={'tracks'}>
            {children}
            <div className={'form'}>
                <button onClick={() => getTracks(0)}>get tracks</button>
                <button onClick={() => getTracksInfo(Math.max(0, items.length - 100))}>analyze tracks</button>
                <input type="checkbox" id="exactTempo" onChange={(e) => setExactTempo(e.target.checked)}></input>
                <label for="exactTempo">show exact tempo?</label>
                <input type="checkbox" id="normalizeMode" onChange={(e) => setNormalizeMode(e.target.checked)}></input>
                <label for="normalizeMode">normalize mode?</label>
                <input type="checkbox" id="normalizeTempo" onChange={(e) => setNormalizeTempo(e.target.checked)}></input>
                <label for="normalizeTempo">normalize tempo?</label>
            </div>
            <div className={'track headers'}>
                <span onClick={() => sortBy('name')}>TITLE {sorting === 'name' ? '↾' : (sorting === 'name inv' ? '⇂' : '')}</span>
                <span>ARTIST</span>
                <span onClick={() => sortBy('tempo')}>BPM {sorting === 'tempo' ? '↾' : (sorting === 'tempo inv' ? '⇂' : '')} {normalizeTempo ? '*' : ''}</span>
                <span onClick={() => sortBy('key')}>KEY {sorting === 'key' ? '↾' : (sorting === 'key inv' ? '⇂' : '')}</span>
            </div>
            {items && items.map((item, index) => {
                return (<div className={'track'}>
                            <span className={'name'}>{item.track.name}</span>
                            <span className={'artists'}>{item.track.artists.map((artist, index) => {return (index > 0 ? ', ' : '') + artist.name})}</span>
                            {showIds && <span className={'id'}>{item.track.id}</span>}
                            {item.features && <span className={'tempo'}>{exactTempo ? (normalizeTempo && item.features.tempo < 90 ? item.features.tempo * 2 : item.features.tempo) : Math.round((normalizeTempo && item.features.tempo < 90 ? item.features.tempo * 2 : item.features.tempo) * 10) / 10}</span>}
                            {item.features && <span className={'key'}>{normalizeMode ? ((item.features.mode == 1 ? (keys[item.features.key]) : (keys[(item.features.key + 3) % keys.length])) + ' Major') : (keys[item.features.key] + ' ' + (item.features.mode == 1 ? 'Major' : 'Minor'))}</span>}
                            <span><a href={`https://www.youtube.com/results?search_query=${item.track.name.replaceAll(' ', '+') + '+' + item.track.artists[0].name.replaceAll(' ', '+')}+audio`}>.wav</a></span>
                        </div>)
            })}
            {items && items.length < total && <button onClick={() => getTracks(items.length)}>get more</button>}
        </div>
    )
}

export default TracksPage;
