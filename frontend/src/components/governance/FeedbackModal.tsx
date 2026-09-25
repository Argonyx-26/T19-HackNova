import React, { useState } from 'react';
import { MessageSquare, X, Check, AlertOctagon } from 'lucide-react';
import { api } from '../../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  situationId: string;
  predictionId?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  situationId,
  predictionId,
  onClose,
  onSubmitted
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('FALSE_POSITIVE');
  const [comments, setComments] = useState<string>('');
  const [observedResult, setObservedResult] = useState<string>('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        situation_id: situationId,
        prediction_id: predictionId,
        feedback_type: feedbackType,
        comments,
        observed_result: observedResult
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComments('');
        onSubmitted?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit operator feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              Operator Decision Feedback (HITL)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-emerald-400 space-y-2">
            <Check className="w-8 h-8 mx-auto" />
            <div className="text-sm font-bold">Feedback Recorded to Forensic Audit Trail</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                Feedback Classification
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="FALSE_POSITIVE">False Positive (Benign Alert)</option>
                <option value="CORRECT">Correct (True Positive Assessment)</option>
                <option value="INCORRECT">Incorrect (Faulty Assessment)</option>
                <option value="FALSE_NEGATIVE">False Negative (Missed Activity)</option>
                <option value="UNCERTAIN">Uncertain (Under Investigation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                Observed Ground Truth
              </label>
              <input
                type="text"
                value={observedResult}
                onChange={(e) => setObservedResult(e.target.value)}
                placeholder="e.g. Authorized drill, Routine entry, Hardware glitch"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                Operator Notes & Context
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                required
                placeholder="Detail rationale for human override or correction..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-2.5 bg-neutral-950/80 border border-neutral-800/80 rounded text-[11px] text-neutral-400 flex items-start space-x-2">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Feedback is retained in immutable audit logs for offline model evaluation. Production state machine rules are preserved.
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-neutral-800/60 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
