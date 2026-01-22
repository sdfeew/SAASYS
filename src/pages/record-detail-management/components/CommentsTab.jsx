import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import commentService from '../../../services/commentService';
import { Send, Heart, Reply, Trash2, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

const CommentsTab = ({ tenantId, recordId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [recordId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await commentService.listByRecord(recordId);
      if (err) throw err;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse mentions from text (e.g., @username)
  const parseMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setError(null);
      const mentions = parseMentions(newComment);
      
      const { error: err } = await commentService.create(
        tenantId,
        recordId,
        newComment,
        mentions
      );
      
      if (err) throw err;
      
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      setError(null);
      const { error: err } = await commentService.delete(commentId);
      if (err) throw err;
      await fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Comment Header */}
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
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-gray-700 mb-3">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <Heart size={16} />
                  <span className="text-sm">{comment.likes_count || 0}</span>
                </button>
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
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
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = () => {
    if (newComment?.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId) => {
    if (replyText?.trim()) {
      onReply(commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment?.id} className={`${isReply ? 'ml-8 md:ml-12 lg:ml-16' : ''}`}>
      <div className="flex gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-muted">
            <Image
              src={comment?.userAvatar}
              alt={comment?.userAvatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm md:text-base font-medium text-foreground truncate">
                  {comment?.userName}
                </span>
                <span className="caption text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(comment?.timestamp)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                iconName="MoreVertical"
                className="flex-shrink-0"
              />
            </div>
            <p className="text-sm md:text-base text-foreground whitespace-pre-wrap">
              {comment?.content}
            </p>
            {comment?.mentions && comment?.mentions?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {comment?.mentions?.map((mention, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                  >
                    <Icon name="AtSign" size={12} />
                    {mention}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={() => setReplyingTo(comment?.id)}
              className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Icon name="Reply" size={14} />
              Reply
            </button>
            {!isReply && comment?.replies && comment?.replies?.length > 0 && (
              <span className="text-xs md:text-sm text-muted-foreground">
                {comment?.replies?.length} {comment?.replies?.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>

          {replyingTo === comment?.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e?.target?.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyPress={(e) => e?.key === 'Enter' && handleSubmitReply(comment?.id)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Send"
                onClick={() => handleSubmitReply(comment?.id)}
              >
                Reply
              </Button>
            </div>
          )}

          {comment?.replies && comment?.replies?.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment?.replies?.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-medium text-foreground mb-4">
          Add Comment
        </h3>
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e?.target?.value)}
            placeholder="Write a comment... Use @ to mention team members"
            rows={4}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-background border border-input rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" iconName="Bold" />
              <Button variant="ghost" size="sm" iconName="Italic" />
              <Button variant="ghost" size="sm" iconName="Link" />
              <Button variant="ghost" size="sm" iconName="AtSign" />
            </div>
            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              onClick={handleSubmitComment}
              disabled={!newComment?.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-base md:text-lg font-medium text-foreground">
          Comments ({comments?.length})
        </h3>
        {comments?.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments?.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsTab;