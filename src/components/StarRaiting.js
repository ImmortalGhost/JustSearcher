import React, {useState} from 'react'
import {FaStar} from 'react-icons/fa';

const Star = ({selected = false, onSelect = f => f }) => (
    <FaStar color={selected ? "red" : "grey"} onClick={onSelect}/>
);

const createArray = length => [...Array(length)];

function StarRaiting({totalStars = 5}) {
    const [selectedStars, setSelectedStars] = useState(0);
    return (
        <div>
            {createArray(totalStars).map((n, i) => (
                <Star key={i} selected={selectedStars > i} onSelect={() => setSelectedStars(i + 1)}></Star>
            ))}
            <p>
                {selectedStars} of {totalStars} stars
            </p>
        </div>
    );
}

export default StarRaiting