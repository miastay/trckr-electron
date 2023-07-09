import { useState, useEffect } from 'react';


const SearchBar = ({updateQuery}) => {

    const [query, setQuery] = useState('');

    return (
        <div className={'x'}>
            <input type="text" placeholder="search..." onChange={(e) => setQuery(e.target.value)}/>
            <button onClick={() => updateQuery(query)}>search</button>
        </div>
    )
}

export default SearchBar;
