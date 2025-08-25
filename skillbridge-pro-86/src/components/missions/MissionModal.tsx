import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import MissionForm from '../../pages/missions/MissionForm';
import { Button } from '../../components/ui/button';

interface MissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId?: string;
}

const MissionModal: React.FC<MissionModalProps> = ({ open, onOpenChange, missionId }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{missionId ? 'Edit Mission' : 'Post Mission'}</DialogTitle>
          </DialogHeader>

          {/* scrollable body */}
          <div className="pt-2 overflow-auto max-h-[70vh] pr-2">
            <MissionForm missionId={missionId} onClose={() => onOpenChange(false)} />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default MissionModal;
