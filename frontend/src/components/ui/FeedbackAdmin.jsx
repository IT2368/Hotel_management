import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [reply, setReply] = useState({});

  useEffect(() => {
    api.getAllFeedback().then(res => setFeedbacks(res.data || res));
  }, []);

  const handleDelete = async (id) => {
    await api.deleteFeedback(id);
    setFeedbacks(fb => fb.filter(f => f._id !== id));
  };

  const handleReply = async (id) => {
    await api.replyFeedback(id, reply[id]);
    setReply(r => ({ ...r, [id]: '' }));
    // Optionally refresh feedbacks
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Feedback</h2>
      <ul>
        {feedbacks.map(fb => (
          <li key={fb._id} className="border p-2 mb-2">
            <div><b>{fb.name}</b> ({fb.email}) - Rating: {fb.rating}</div>
            <div>{fb.message}</div>
            <div>Reply: {fb.reply || 'No reply yet'}</div>
            <input
              className="border p-1 mr-2"
              value={reply[fb._id] || ''}
              onChange={e => setReply(r => ({ ...r, [fb._id]: e.target.value }))}
              placeholder="Type reply"
            />
            <button className="bg-green-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleReply(fb._id)}>Reply</button>
            <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(fb._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
