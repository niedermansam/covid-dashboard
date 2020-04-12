import React, { useState, useEffect } from 'react';
import {usStates} from './states'

export const StateSelect:React.FC<{onChange:(e:React.ChangeEvent) => void, selected: string}> = ({onChange, selected}) => {
     
    return(
        <div>
            <select onChange={onChange}>
                {usStates.map(x => <option value={x.abbreviation} selected={x.abbreviation === selected}>{x.name}</option>)}
            </select>
        </div>
    )
}