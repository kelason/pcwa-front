import React, { useState } from 'react';
import { AuthServices } from '../../services/AuthServices';
import { useToast } from '../atoms/toastContext';
import { Button } from '../atoms/Button';
import { FormField, FORM_INPUT_CLASSES } from '../molecules/FormField';
import { Modal } from '../atoms/Modal';

interface LoginModalProps {
  onClose: () => void;
  onLoggedIn: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoggedIn }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await AuthServices.login(email.trim(), password);
      toast.success('Logged in.');
      onLoggedIn();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Login to edit" maxWidth="max-w-sm">
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Email">
          <input type="email" required placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} className={FORM_INPUT_CLASSES} />
        </FormField>
        <FormField label="Password">
          <input type="password" required placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} className={FORM_INPUT_CLASSES} />
        </FormField>
        <p className="text-xs text-slate-500 text-left">Browsing is public. Editing needs a staff account from Supabase Auth.</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>Login</Button>
        </div>
      </form>
    </Modal>
  );
};
