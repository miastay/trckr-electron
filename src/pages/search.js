import { useState, useEffect } from 'react';
import SearchBar from '../components/searchbar';
import { generateAPIKey } from '../api/key';

const SearchPage = ({}) => {

    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);

    async function getData(query)
    {
        let key = await generateAPIKey()
        console.log(key)
        let tracks = ['6Ofa1NkXFDu1MhQkrb5ilm','4THvALrKGKvQCMs7b19jTQ']
        let ids = tracks.join('%2c');
        let url = `https://api.spotify.com/v1/audio-features?ids=${ids}`
        fetch(url, {headers: {
            'Authorization': `Bearer  ${key.access_token}`
        }}).then((res) => res.json()).then((data) => console.log(data))
    }

    return (
        <div className={'x'}>
            <h1>search for a song</h1>
            <SearchBar updateQuery={setQuery}/>
            <span>{query}</span>
            <button onClick={() => getData(query)}>fetch</button>
            {result && <span>
                {JSON.stringify(result.items[0])}
            </span>}
        </div>
    )
}

export default SearchPage;
