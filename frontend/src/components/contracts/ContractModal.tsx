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
  // optional clientId to prefill and hide the input
  clientId?: string;
  onCreate?: (data: CreateContractRequest) => void;
}

const defaultValues: Partial<CreateContractRequest> = {
  clientId: '',
  templateId: undefined,
  terms: { scope: '', deliverables: [] },
  hourlyRate: undefined,
  fixedPrice: undefined,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
};

const ContractModal: React.FC<Props> = ({ open, onOpenChange, missionId, freelancerId, clientId, onCreate }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<CreateContractRequest>({ defaultValues: defaultValues as CreateContractRequest });

  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, missionId, freelancerId } as any);
      // if clientId prop was provided, set it on the form so it's submitted but not shown
      if (clientId) {
        setValue('clientId' as any, clientId);
      }
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
              defaultValue={''}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean);
                setValue('terms.deliverables' as any, val);
              }}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {!clientId && (
            <div>
              <label className="block text-sm mb-1">Client (company) ID</label>
              <input {...register('clientId')} className="w-full border rounded px-2 py-1" />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Template ID (optional)</label>
            <input {...register('templateId')} className="w-full border rounded px-2 py-1" />
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
            <div>
              <label className="block text-sm mb-1">Fixed Price (optional)</label>
              <input type="number" {...register('fixedPrice', { valueAsNumber: true })} className="w-full border rounded px-2 py-1" />
            </div>
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
