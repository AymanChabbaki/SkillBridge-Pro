import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { CompanyProfile } from '../../services/types';
import { Button } from '../ui/button';
import { profileService } from '../../services/profileService';
import { patch as apiPatch } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

type Props = {
  open: boolean;
  onClose: () => void;
  profile: CompanyProfile | null;
  onSaved: (updated: CompanyProfile) => void;
};

const EditCompanyModal: React.FC<Props> = ({ open, onClose, profile, onSaved }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [valuesText, setValuesText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setIndustry(profile.industry || '');
      setSize(profile.size || '');
      setDescription(profile.description || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
      setValuesText(Array.isArray(profile.values) ? profile.values.join(', ') : '');
      setAvatarUrl('');
      setPreviewUrl('');
      setFileError(null);
    }
  }, [profile]);

  const MAX_BYTES = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (f?: File | null) => {
    setFileError(null);
    setPreviewUrl('');
    setAvatarUrl('');

    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setFileError('Please select an image file');
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please select an image file' });
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError('Image too large (max 5MB)');
      toast({ variant: 'destructive', title: 'File too large', description: 'Please choose an image under 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setAvatarUrl(result);
    };
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const values = valuesText.split(',').map(s => s.trim()).filter(Boolean);
      const updated: any = {
        name,
        industry,
        size,
        description,
        website,
        location,
        values,
      };

      const saved = await profileService.updateCompanyProfile(updated);

      // If avatar provided, update user avatar on user table
      try {
        if (avatarUrl && user?.id) {
          await apiPatch(`/users/${user.id}`, { avatar: avatarUrl });
        }
      } catch (userErr) {
        console.warn('Failed to update user avatar', userErr);
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Failed to save company profile', err);
      toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save company profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Company Profile">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <input value={size} onChange={e => setSize(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Values (comma separated)</label>
          <input value={valuesText} onChange={e => setValuesText(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo / Avatar</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <input type="file" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
              <span className="text-xs text-muted-foreground">Or paste an image URL below</span>
            </div>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">No image</div>
            )}
          </div>
          {fileError && <div className="text-sm text-destructive">{fileError}</div>}
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input value={avatarUrl} onChange={e => { setAvatarUrl(e.target.value); setPreviewUrl(e.target.value); }} className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCompanyModal;
