import React, { useState, useEffect } from 'react';
import { Send, Heart, Reply, Trash2, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

const CommentsTab = ({ tenantId, recordId }) => {
  const [comments, setComments] = useState([
    {
      id: '1',
      user_id: 'user-manager-001',
      content: 'Great performance this quarter! Keep up the excellent work. @user-admin-001',
      created_at: '2026-01-22T10:30:00Z',
      likes_count: 2,
      replies: [{
        id: 'r1',
        user_id: 'user-admin-001',
        content: 'Thank you! Really appreciate the feedback.',
        created_at: '2026-01-22T11:00:00Z'
      }]
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user_id: 'current-user',
      content: newComment,
      created_at: new Date().toISOString(),
      likes_count: 0,
      replies: []
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    setComments(comments.filter(c => c.id !== commentId));
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{comment.user_id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-gray-700 mb-3">{comment.content}</p>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <Heart size={16} />
                  <span className="text-sm">{comment.likes_count || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Reply size={16} />
                  <span className="text-sm">Reply</span>
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <User size={16} className="text-green-600" />
                        </div>
                        <p className="font-semibold text-sm text-gray-900">{reply.user_id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add a comment
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment... (Use @username to mention someone)"
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Send size={18} />
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsTab;
