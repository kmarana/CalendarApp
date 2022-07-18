import React, { useState } from 'react';

export const NewEventModal = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(false);

  // const addEvent = async event =>
  // {
  //   event.preventDefault();

  //   let tok = storage.retrieveToken();
  //   let obj = {userId:userId,title:title.value,jwtToken:tok};
  //   let js = JSON.stringify(obj);
  // }

  return(
    <>
      <div id="newEventModal">
        <h2>New Event</h2>

        <input type="text"
          className={error ? 'error' : ''}
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          id="eventTitleInput" 
          placeholder="Event Title" 
        />

        <input type="text"
          className={error ? 'error' : ''}
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          id="eventDescriptionInput" 
          placeholder="Event Description" 
        />

        <button 
          onClick={() => {
            if (title) {
              setError(false);
              onSave(title);
            }
            if (description) {
              setError(false);
              onSave(description);
            } else {
              setError(true);
            }
          }} 
          id="saveButton">Save</button>


        <button 
          onClick={onClose}
          id="cancelButton">Cancel</button>
      </div>

      <div id="modalBackDrop"></div>
    </>
  );
};