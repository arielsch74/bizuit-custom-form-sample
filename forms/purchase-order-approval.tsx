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

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrderFormData {
  vendorName: string;
  vendorId: string;
  orderDate: string;
  deliveryDate: string;
  department: string;
  items: PurchaseOrderItem[];
  notes: string;
  urgency: string;
}

interface PurchaseOrderApprovalFormProps {
  initialData?: Partial<PurchaseOrderFormData>;
  onSubmit: (data: PurchaseOrderFormData) => void;
  onCancel?: () => void;
}

export default function PurchaseOrderApprovalForm({
  initialData = {},
  onSubmit,
  onCancel,
}: PurchaseOrderApprovalFormProps) {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    vendorName: initialData.vendorName || '',
    vendorId: initialData.vendorId || '',
    orderDate: initialData.orderDate || new Date().toISOString().split('T')[0],
    deliveryDate: initialData.deliveryDate || '',
    department: initialData.department || '',
    items: initialData.items || [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
    ],
    notes: initialData.notes || '',
    urgency: initialData.urgency || 'normal',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PurchaseOrderFormData, string>>>({});

  const handleChange = (field: keyof PurchaseOrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    handleChange('items', newItems);
  };

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    handleChange('items', [...formData.items, newItem]);
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      handleChange('items', newItems);
    }
  };

  const calculateGrandTotal = (): number => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PurchaseOrderFormData, string>> = {};

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }
    if (!formData.vendorId.trim()) {
      newErrors.vendorId = 'Vendor ID is required';
    }
    if (!formData.orderDate) {
      newErrors.orderDate = 'Order date is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }
    if (formData.orderDate && formData.deliveryDate && formData.orderDate > formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date must be after order date';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (formData.items.some((item) => !item.description.trim())) {
      newErrors.items = 'All items must have a description';
    }
    if (formData.items.some((item) => item.quantity <= 0)) {
      newErrors.items = 'All items must have a quantity greater than 0';
    }
    if (formData.items.some((item) => item.unitPrice <= 0)) {
      newErrors.items = 'All items must have a unit price greater than 0';
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
    <BizuitCard title="Purchase Order Approval">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name *</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => handleChange('vendorName', e.target.value)}
              placeholder="Enter vendor name"
            />
            {errors.vendorName && (
              <p className="text-sm text-red-500">{errors.vendorName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor ID *</Label>
            <Input
              id="vendorId"
              value={formData.vendorId}
              onChange={(e) => handleChange('vendorId', e.target.value)}
              placeholder="Enter vendor ID"
            />
            {errors.vendorId && (
              <p className="text-sm text-red-500">{errors.vendorId}</p>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orderDate">Order Date *</Label>
            <Input
              id="orderDate"
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleChange('orderDate', e.target.value)}
            />
            {errors.orderDate && (
              <p className="text-sm text-red-500">{errors.orderDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Delivery Date *</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => handleChange('deliveryDate', e.target.value)}
            />
            {errors.deliveryDate && (
              <p className="text-sm text-red-500">{errors.deliveryDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency *</Label>
            <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          {errors.department && (
            <p className="text-sm text-red-500">{errors.department}</p>
          )}
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Order Items *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              Add Item
            </Button>
          </div>

          {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg">
                <div className="col-span-12 md:col-span-4">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Unit Price"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input value={`$${item.total.toFixed(2)}`} disabled />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="font-semibold">Grand Total:</span>
            <span className="text-xl font-bold">${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional information or special instructions"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Submit for Approval</Button>
        </div>
      </form>
    </BizuitCard>
  );
}
