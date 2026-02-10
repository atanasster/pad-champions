import React from 'react';
import { Button } from './button';
import { Card, CardFooter, CardHeader, CardTitle } from './card';
import { Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive'; // For the confirm button
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200 animate-in fade-in">
      <div className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <Card className="shadow-lg border-opacity-50">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <div className="text-sm text-muted-foreground pt-2">{message}</div>
          </CardHeader>
          <CardFooter className="flex justify-end gap-3">
            {onConfirm ? (
              <>
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {confirmText}
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>OK</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
