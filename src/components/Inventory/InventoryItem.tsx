
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, AlertCircle, Eye } from 'lucide-react';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { useRouter } from 'next/navigation';

interface InventoryItemProps extends InventoryItemType {
  onEdit?: (item: InventoryItemType) => void;
  onDelete?: (id: string) => void;
}

const InventoryItem = (props: InventoryItemProps) => {
  const {
    id,
    name,
    sanskrit,
    type,
    form,
    dosage,
    anupaan,
    stock = 0,
    lowStockThreshold = 10,
    doshaEffects,
    expiryDate,
    onEdit,
    onDelete,
  } = props;
  const isLowStock = stock <= lowStockThreshold;
  const router = useRouter();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(id) router.push(`/erp/inventory/${id}`);
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(props);
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(id && onDelete) onDelete(id);
  }
  
  return (
    <Card className="overflow-hidden cursor-pointer" onClick={handleView}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-grow p-4">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h3 className="font-medium">{name}</h3>
              {sanskrit && (
                <span className="text-sm text-muted-foreground italic">({sanskrit})</span>
              )}
              {type && (
                <Badge variant={type === 'classical' ? 'outline' : 'default'} className="ml-auto">
                  {type === 'classical' ? 'Classical' : 'Proprietary'}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
              {form && <div>
                <span className="text-xs text-muted-foreground">Form</span>
                <p className="text-sm capitalize">{form}</p>
              </div>}
              
              {dosage && <div>
                <span className="text-xs text-muted-foreground">Dosage</span>
                <p className="text-sm">{dosage}</p>
              </div>}
              
              {anupaan && (
                <div>
                  <span className="text-xs text-muted-foreground">Anupaan</span>
                  <p className="text-sm">{anupaan}</p>
                </div>
              )}
              
              {doshaEffects && doshaEffects.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Dosha Effects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doshaEffects.map(dosha => (
                      <Badge key={dosha} variant="outline" className="text-[10px] py-0 h-4">
                        {dosha}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {expiryDate && (
              <div className="text-xs text-muted-foreground">
                Expires on {new Date(expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <div className={`py-4 px-6 flex flex-col items-center justify-center ${
            isLowStock ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="text-2xl font-bold text-center">
              {stock}
            </div>
            <div className="text-xs uppercase text-muted-foreground">
              in stock
            </div>
            {isLowStock && (
              <div className="mt-2 flex items-center text-red-500 text-xs">
                <AlertCircle size={12} className="mr-1" /> Low stock
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 p-2 border-t">
          {id && onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-muted-foreground hover:text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 size={14} />
            </Button>
          )}
           <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleView}
          >
            <Eye size={14} className="mr-1" /> View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleEditClick}
          >
            <Edit size={14} className="mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryItem;
