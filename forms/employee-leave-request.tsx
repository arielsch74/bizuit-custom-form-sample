import React, { useState } from 'react';
import { BizuitCard } from '@/components/ui/BizuitCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EmployeeLeaveRequestFormData {
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact: string;
}

interface EmployeeLeaveRequestFormProps {
  initialData?: Partial<EmployeeLeaveRequestFormData>;
  onSubmit: (data: EmployeeLeaveRequestFormData) => void;
  onCancel?: () => void;
}

export default function EmployeeLeaveRequestForm({
  initialData = {},
  onSubmit,
  onCancel,
}: EmployeeLeaveRequestFormProps) {
  const [formData, setFormData] = useState<EmployeeLeaveRequestFormData>({
    employeeName: initialData.employeeName || '',
    employeeId: initialData.employeeId || '',
    leaveType: initialData.leaveType || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    reason: initialData.reason || '',
    emergencyContact: initialData.emergencyContact || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeLeaveRequestFormData, string>>>({});

  const handleChange = (field: keyof EmployeeLeaveRequestFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeLeaveRequestFormData, string>> = {};

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Employee name is required';
    }
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <BizuitCard title="Employee Leave Request">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name *</Label>
            <Input
              id="employeeName"
              value={formData.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              placeholder="Enter employee name"
            />
            {errors.employeeName && (
              <p className="text-sm text-red-500">{errors.employeeName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              placeholder="Enter employee ID"
            />
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>
        </div>

        {/* Leave Details */}
        <div className="space-y-2">
          <Label htmlFor="leaveType">Leave Type *</Label>
          <Select
            value={formData.leaveType}
            onValueChange={(value) => handleChange('leaveType', value)}
          >
            <SelectTrigger id="leaveType">
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="personal">Personal Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="unpaid">Unpaid Leave</SelectItem>
            </SelectContent>
          </Select>
          {errors.leaveType && (
            <p className="text-sm text-red-500">{errors.leaveType}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Leave *</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            placeholder="Please provide a reason for your leave request"
            rows={4}
          />
          {errors.reason && (
            <p className="text-sm text-red-500">{errors.reason}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            placeholder="Phone number or email"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Submit Leave Request</Button>
        </div>
      </form>
    </BizuitCard>
  );
}
