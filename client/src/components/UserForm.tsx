// UserForm.tsx
import React, { useState } from 'react';
import { UserModel } from '../models/UserModel';


const UserForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userID, setLocalUserID] = useState('');
  const [userData, setUserData] = useState<UserModel|null>(null);
  const [error, setError] = useState<string>('');

  
  const handleSubmitCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const newUser = await response.json();
        console.log('New user created:', newUser);
        // Clear form fields after successful submission
        setUsername('');
        setPassword('');
        // Optionally display success message
        alert('User created successfully!');
      } else {
        const errorText = await response.text();
        setError(`Failed to create user: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // Handle error
    }
  };

  const handleSubmitFetchUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('/users/fetch-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userID }),
      });

      if (response.ok) {
        const fetchedUser = await response.json();
        setUserData(fetchedUser);
        console.log('Fetched user data:', fetchedUser);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch user: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle error
    }
  };

  return (
    <div style={{display:'none'}}>
      <form onSubmit={handleSubmitCreateUser}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Create User</button>
      </form>

      <hr />

      <form onSubmit={handleSubmitFetchUser}>
        <label>
          Enter User ID to Fetch:
          <input
            type="text"
            value={userID}
            onChange={(e) => setLocalUserID(e.target.value)}
            required
          />
        </label>
        <button type="submit">Fetch User Data</button>
      </form>

      {userData && (
        <div>
          <h2>User Data</h2>
          <p>ID: {userData.id}</p>
          <p>Username: {userData.username}</p>
          <h3>Highscores:</h3>
          <ul>
            {Object.entries(userData.highscores).map(([game, score]: [string, number]) => (
              <li key={game}>
                {game}: {score}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UserForm;
