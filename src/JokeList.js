import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState(() => {
    const savedJokes = JSON.parse(localStorage.getItem("jokes"))
    return savedJokes || []
  });
  const [isLoading, setIsLoading] = useState(jokes.length === 0);

  const getJokes = useCallback(async () => {
    try {
      const newJokes = [];
      const seenJokes = new Set(jokes.filter(j => !j.isLocked).map(j => j.id));

      while (newJokes.length < numJokesToGet) {
        // Fetch a single joke to reduce API usage
        const res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });

        const { id, joke } = res.data;

        if (!seenJokes.has(id)) {
          seenJokes.add(id);
          newJokes.push({ id, joke, votes: 0, isLocked: false });
        } else {
          console.log("duplicate found!");
        }
      }

      const updatedJokes = jokes.filter(j => j.isLocked).concat(newJokes);
      setJokes(updatedJokes);
      localStorage.setItem("jokes", JSON.stringify(updatedJokes));
      setIsLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.error("Rate limit exceeded. Try again later.");
      } else {
        console.error("An error occurred while fetching jokes:", err);
      }
      setIsLoading(false);
    }
  }, [jokes, numJokesToGet]);


  useEffect(() => {
    if (isLoading) getJokes();
  }, [isLoading, getJokes]);

  const generateNewJokes = () => {
    setIsLoading(true);
  };

  const resetVotes = () => {
    const resetJokes = jokes.map(j => ({ ...j, votes: 0 }))
    setJokes(resetJokes)
    localStorage.setItem("jokes", JSON.stringify(resetJokes))
  }

  const vote = (id, delta) => {
    const updatedJokes = jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j)
    setJokes(updatedJokes)
    localStorage.setItem("jokes", JSON.stringify(updatedJokes))
  };

  const toggleLock = id => {
    const updatedJokes = jokes.map(j => j.id === id ? {...j, isLocked: !j.isLocked } : j)
    setJokes(updatedJokes)
    localStorage.setItem("jokes", JSON.stringify(updatedJokes))
  }

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>
      <button className="JokeList-reset" onClick={resetVotes}>
        Reset Votes
      </button>

      {sortedJokes.map((j) => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
          isLocked={j.isLocked}
          toggleLock={toggleLock}
        />
      ))}
    </div>
  );
}

export default JokeList;
