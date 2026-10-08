import { FormEvent, useState } from 'react';
import { userUpdated } from '@/features/auth/authSlice';
import { authApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import { dateOnly } from '@/utils/format';

export default function SellerProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user)!;
  const [name, setName] = useState(user.full_name);
  const [store, setStore] = useState(user.store_name ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      dispatch(userUpdated(await authApi.updateMe({ full_name: name, store_name: store })));
      dispatch(pushToast('success', 'Profile saved'));
    } catch (err) {
      dispatch(pushToast('error', errorMessage(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1>Profile</h1>
      <form className="form-card" onSubmit={save}>
        <div className="fields">
          <div className="field"><label htmlFor="n">Full name</label><input id="n" className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="s">Store name</label><input id="s" className="input" required value={store} onChange={(e) => setStore(e.target.value)} /></div>
          <div className="field"><label>Email</label><input className="input" value={user.email} disabled /></div>
          <div className="field"><label>Member since</label><input className="input" value={dateOnly(user.created_at)} disabled /></div>
        </div>
        <div style={{ marginTop: 16 }}><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </>
  );
}
