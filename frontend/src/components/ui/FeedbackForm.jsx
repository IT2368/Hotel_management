import React, { useState } from 'react';
import api from '../../services/api';

export default function FeedbackForm({ user }) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.submitFeedback({
      userId: user.userId,
      name: user.name,
      email: user.email,
      message,
      rating,
    });
    setSuccess(true);
    setMessage('');
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Leave Feedback</h2>
      {success && <div className="text-green-600 mb-2">Thank you for your feedback!</div>}
      <textarea
        className="w-full border mb-2 p-2"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Your feedback"
        required
      />
      <div className="mb-2">
        <label>Rating: </label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <button className="bg-blue-500 text-white px-4 py-1 rounded" type="submit">Submit</button>
    </form>
  );
}
