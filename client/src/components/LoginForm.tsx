import React, { useState } from 'react';

const LoginForm: React.FC<{setUserID: (userID: number) => void}> = ({ setUserID }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Raw response:', response);

      if (response.ok) {
        const { id } = await response.json();
        console.log('Parsed response: ', id);
        setUserID(id);
        console.log('User logged in: ', id);
        alert('LOGGED SUCCESSFULL!');
      } else {
        const errorText = await response.text();
        setError(`Failed to login: ${errorText}`);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred during login.');
    }
  };


  return (
    <form name="login-form" onSubmit={handleLogin}>
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
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default LoginForm;
