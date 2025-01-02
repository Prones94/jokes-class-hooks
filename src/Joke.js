import React from 'react'
import './Joke.css'

function Joke({ id, vote, votes, text, lock , toggleLock, isLocked }){
  return (
    <div className="Joke">
      <div className="Joke-votearea">
        <button onClick={() => vote(id, +1)} disabled={isLocked}>
          <i className='fas fa-thumbs-up' />
        </button>
        <button onClick={() => vote(id, -1)} disabled={isLocked}>
          <i className='fas fa-thumbs-down' />
        </button>

        {votes}
      </div>

      <div className="Joke-text">{text}</div>

      <button onClick={() => toggleLock(id)}>
        {isLocked ? "Unlock" : "Lock"}
      </button>
    </div>
  )
}
export default Joke