import React, { useState } from 'react';

function CardUI()
{
    let bp = require('./Path.js');

    let calName = '';
    let search = '';

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [calendarList,setCalendarList] = useState('');

    let _ud = localStorage.getItem('user_data');
    let ud = JSON.parse(_ud);
    let userId = ud.id;

    let storage = require('../tokenStorage.js');
    require("jsonwebtoken");

    const addCalendar = async event => 
    {
        event.preventDefault();

        let tok = storage.retrieveToken();
        let obj = {userId:userId,calName:calName.value,jwtToken:tok};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath('api/addCalendar'),
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            let res = JSON.parse(await response.text());
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
                setMessage('Calendar has been added');
                storage.storeToken(res.jwtToken);
            }
        }
        catch(e)
        {
            setMessage(e.toString());
        }

        tok = storage.retrieveToken();
        obj = {userId:userId,calName:calName.value,jwtToken:tok};
        js = JSON.stringify(obj);
    };

    const searchCalendar = async event => 
    {
        event.preventDefault();
        
        var tok = storage.retrieveToken();
        var obj = {userId:userId,search:search.value,jwtToken:tok};
        var js = JSON.stringify(obj);

        try
        {
            const response = await fetch(bp.buildPath('api/searchCalendar'),
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            for( var i=0; i<_results.length; i++ )
            {
                resultText += _results[i];
                if( i < _results.length - 1 )
                {
                    resultText += ', ';
                }
            }
            setResults('Calendar(s) have been retrieved');
            setCalendarList(resultText);
            storage.storeToken(res.jwtToken);
        }
        catch(e)
        {
            alert(e.toString());
            setResults(e.toString());
        }
    };

    return(
        <div id="cardUIDiv">
        <br />
        <input type="text" id="searchText" placeholder="Calendar To Search For" 
            ref={(c) => search = c} />
        <button type="button" id="searchCardButton" class="buttons" 
            onClick={searchCalendar}> Search Calendar</button><br />
        <span id="calendarSearchResult">{searchResults}</span>
        <p id="calendarList">{calendarList}</p><br /><br />
        <input type="text" id="cardText" placeholder="Calendar To Add" 
            ref={(c) => calName = c} />
        <button type="button" id="addCardButton" class="buttons" 
            onClick={addCalendar}> Add Calendar </button><br />
        <span id="cardAddResult">{message}</span>
        </div>
    );
}

export default CardUI;