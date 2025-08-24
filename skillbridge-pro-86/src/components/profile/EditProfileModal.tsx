import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { FreelancerProfile } from '../../services/types';
import { Button } from '../ui/button';
import { patch as apiPatch } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  profile: FreelancerProfile | null;
  onSaved: (updated: FreelancerProfile) => void;
};

const EditProfileModal: React.FC<Props> = ({ open, onClose, profile, onSaved }) => {
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [dailyRate, setDailyRate] = useState<string>('');
  const [skillsText, setSkillsText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [languagesText, setLanguagesText] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available'|'busy'|'unavailable'>('available');
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityDays, setAvailabilityDays] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setDailyRate(profile.dailyRate ? String(profile.dailyRate) : '');
  setAvatarUrl(profile.user?.avatar || '');
  setPreviewUrl(profile.user?.avatar || '');
  setSkillsText(profile.skills && Array.isArray(profile.skills) ? profile.skills.map((s:any) => (typeof s === 'string' ? s : s.name)).join(', ') : '');
  setAvailabilityStatus(profile.availability?.status || 'available');
  setAvailabilityStart(profile.availability?.startDate || '');
  setAvailabilityDays((profile.availability as any)?.daysPerWeek ? String((profile.availability as any).daysPerWeek) : '');
  setLanguagesText(profile.languages && Array.isArray(profile.languages) ? profile.languages.join(', ') : '');
    }
  }, [profile]);

  const { toast } = useToast();

  const MAX_BYTES = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (f?: File | null) => {
    setFileError(null);
    setSelectedFile(null);
    setPreviewUrl('');

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
      setAvatarUrl(result); // use data URL as avatar fallback (will be sent to backend)
      setSelectedFile(f);
    };
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // Normalize skills to objects with a default level (backend requires level)
      const skills = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, level: 'intermediate' }));

      // Build availability matching DTO (only include allowed fields)
      const availability: any = {
        status: availabilityStatus,
      } as any;
      if (availabilityStart) availability.startDate = availabilityStart;

      // Ensure required fields that backend expects are present
      const seniority = (profile as any).seniority || 'mid';
      const remote = typeof (profile as any).remote === 'boolean' ? (profile as any).remote : true;

      const languages = languagesText.split(',').map(s => s.trim()).filter(Boolean);

      const updated: any = {
        title,
        bio,
        skills,
        seniority,
        dailyRate: dailyRate ? Number(dailyRate) : undefined,
        availability,
        location,
        remote,
        languages: languages.length > 0 ? languages : (profile as any).languages || undefined,
        experience: (profile as any).experience || undefined,
      };

      if (avatarUrl) {
        // avatar is not part of DTO but include nested user.avatar for backend services that accept it
        updated.user = { ...(profile?.user || {}), avatar: avatarUrl };
      }

      // Call backend update via window.__profileService__ if available (injected) or import lazily
      let updateFn: any = (window as any).__profileService__?.updateFreelancerProfile;
      if (!updateFn) {
        updateFn = await import('../../services/profileService').then(m => m.profileService.updateFreelancerProfile);
      }

      const saved = await updateFn(updated);

      // update avatar on User table if changed
      try {
        if (avatarUrl && profile?.user?.id && avatarUrl !== profile.user.avatar) {
          await apiPatch(`/users/${profile.user.id}`, { avatar: avatarUrl });
        }
      } catch (userErr) {
        console.warn('Failed to update user avatar', userErr);
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border rounded px-2 py-1" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Daily Rate</label>
            <input value={dailyRate} onChange={e => setDailyRate(e.target.value)} type="number" className="w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Avatar</label>
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

        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input value={skillsText} onChange={e => setSkillsText(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Languages (comma separated)</label>
          <input value={languagesText} onChange={e => setLanguagesText(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Availability</label>
            <select value={availabilityStatus} onChange={e => setAvailabilityStatus(e.target.value as any)} className="w-full border rounded px-2 py-1">
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" value={availabilityStart} onChange={e => setAvailabilityStart(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Days / week</label>
            <input value={availabilityDays} onChange={e => setAvailabilityDays(e.target.value)} className="w-full border rounded px-2 py-1" />
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

export default EditProfileModal;
