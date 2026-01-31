import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { commentService } from '../../../services/commentService';

const CommentsTab = ({ recordId, moduleId, tenantId, userId, userName, comments = [], onCommentAdded }) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingCommentId) {
        await commentService.update(editingCommentId, commentText);
        setEditingCommentId(null);
      } else if (replyingTo) {
        await commentService.reply(recordId, moduleId, commentText, tenantId, userId, replyingTo);
        setReplyingTo(null);
      } else {
        await commentService.add(recordId, moduleId, commentText, tenantId, userId);
      }
      setCommentText('');
      onCommentAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      onCommentAdded?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const filteredComments = comments.filter(c =>
    c.comment_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.author?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCommentThread = (comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8' : ''}`}>
      <div className="bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold">{comment.author?.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{comment.author?.full_name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
            </div>
          </div>
          {comment.author_id === userId && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setCommentText(comment.comment_text);
                }}
                className="p-1 rounded hover:bg-muted transition"
                title="Edit">
                <Icon name="Edit2" size={16} />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 rounded hover:bg-destructive/10 text-destructive transition"
                title="Delete">
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          )}
        </div>

        <p className="text-sm mb-3">{comment.comment_text}</p>
        {comment.is_edited && (
          <p className="text-xs text-muted-foreground mb-3 italic">Edited {formatDate(comment.edited_at)}</p>
        )}

        <button
          onClick={() => setReplyingTo(comment.id)}
          className="text-xs text-primary hover:underline">
          Reply
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map(reply => renderCommentThread(reply, depth + 1))}
        </div>
      )}

      {replyingTo === comment.id && (
        <div className="ml-8 mt-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold mb-2">Reply to {comment.author?.full_name}</p>
          <textarea
            value={editingCommentId === comment.id ? commentText : ''}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-2 border border-border rounded-lg bg-background text-foreground text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
            rows="3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddComment}
              disabled={isSubmitting}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 py-1 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <div className="bg-muted/30 p-4 rounded-lg border border-border">
        <p className="text-sm font-semibold mb-2">Add a comment</p>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
        />
        <div className="flex gap-2">
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
            {isSubmitting ? 'Sending...' : editingCommentId ? 'Update' : 'Post'}
          </button>
          {editingCommentId && (
            <button
              onClick={() => {
                setEditingCommentId(null);
                setCommentText('');
              }}
              className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Search Comments */}
      {comments.length > 0 && (
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{searchTerm ? 'No comments match your search' : 'No comments yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map(comment => renderCommentThread(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsTab;
