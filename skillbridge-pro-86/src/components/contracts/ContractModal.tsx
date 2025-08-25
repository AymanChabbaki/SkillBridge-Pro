import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useForm } from 'react-hook-form';
import { CreateContractRequest } from '../../services/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  freelancerId: string;
  onCreate?: (data: CreateContractRequest) => void;
}

const defaultValues: Partial<CreateContractRequest> = {
  terms: { scope: '', deliverables: [] },
  hourlyRate: 0,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
};

const ContractModal: React.FC<Props> = ({ open, onOpenChange, missionId, freelancerId, onCreate }) => {
  const { register, handleSubmit, reset, watch } = useForm<CreateContractRequest>({ defaultValues: defaultValues as CreateContractRequest });

  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, missionId, freelancerId } as any);
    }
  }, [open, missionId, freelancerId, reset]);

  const submit = (data: CreateContractRequest) => {
    onCreate && onCreate(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>Fill the required details to create the contract between company and freelancer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Scope</label>
            <input {...register('terms.scope')} className="w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm mb-1">Deliverables (comma separated)</label>
            <input
              {...register('terms.deliverables')}
              onChange={(e) => {
                // map csv to array
                const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                e.target.value = JSON.stringify(val);
              }}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Hourly Rate</label>
              <input type="number" {...register('hourlyRate', { valueAsNumber: true })} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input type="date" {...register('startDate')} className="w-full border rounded px-2 py-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input type="date" {...register('endDate')} className="w-full border rounded px-2 py-1" />
            </div>
            <div />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModal;
