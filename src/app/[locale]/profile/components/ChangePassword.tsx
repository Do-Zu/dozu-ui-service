'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Info, Check, X, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordProps {
  onPasswordChange?: (data: PasswordData) => Promise<void>;
  onClose?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onPasswordChange, onClose }) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous errors when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const validatePassword = (password: string): boolean => {
    // Password validation rules
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = passwordData.newPassword ? getPasswordStrength(passwordData.newPassword) : null;

  const handleSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return;
    }
    
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }
    
    try {
      if (onPasswordChange) {
        await onPasswordChange(passwordData);
      } else {
        // Default implementation - simulate API call
        console.log('Changing password...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Reset form on success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordSuccess('Password changed successfully!');
      
      // Show toast notification
      toast({
        title: 'Success',
        description: 'Password changed successfully!',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to change password. Please try again.';
      setPasswordError(errorMessage);
      
      // Show toast error notification
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-5 max-w-md mx-auto relative pt-1">
        {/* Close Button */}
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute -top-1 -right-1 h-9 w-9 p-0 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors z-10 shadow-sm border border-border hover:border-destructive bg-background"
            title="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
          Current Password
        </Label>
        <div className="relative group">
          <Input
            id="currentPassword"
            type={showPassword.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            placeholder="Enter your current password"
            className="pr-10- h-10 rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted rounded-md transition-colors"
            onClick={() => togglePasswordVisibility('current')}
          >
            {showPassword.current ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
            New Password
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-popover text-popover-foreground border border-border shadow-xl">
              <p className="text-sm">Use at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*...)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative group">
          <Input
            id="newPassword"
            type={showPassword.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Enter your new password"
            className="pr-11 h-11 rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted rounded-md transition-colors"
            onClick={() => togglePasswordVisibility('new')}
          >
            {showPassword.new ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {/* Password Strength Meter */}
        {passwordData.newPassword && passwordStrength && (
          <div className="mt-3 p-4 bg-muted rounded-xl border border-border space-y-3 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Password strength</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                passwordStrength.score <= 2 ? 'bg-red-100 text-red-700' :
                passwordStrength.score === 3 ? 'bg-yellow-100 text-yellow-700' :
                passwordStrength.score === 4 ? 'bg-blue-100 text-blue-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full shadow-sm ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                passwordData.newPassword.length >= 8 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
              }`}>
                {passwordData.newPassword.length >= 8 ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={passwordData.newPassword.length >= 8 ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}>
                  8+ characters
                </span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                /[a-z]/.test(passwordData.newPassword) && /[A-Z]/.test(passwordData.newPassword) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
              }`}>
                {/[a-z]/.test(passwordData.newPassword) && /[A-Z]/.test(passwordData.newPassword) ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={/[a-z]/.test(passwordData.newPassword) && /[A-Z]/.test(passwordData.newPassword) ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}>
                  Upper & lowercase
                </span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                /\d/.test(passwordData.newPassword) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
              }`}>
                {/\d/.test(passwordData.newPassword) ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={/\d/.test(passwordData.newPassword) ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}>
                  One number
                </span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-muted'
              }`}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-700 dark:text-green-300 font-medium' : 'text-muted-foreground'}>
                  Special character
                </span>
              </div>
            </div>
          </div>
        )}
        
        {!passwordData.newPassword && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            <span>Password must be at least 8 characters with uppercase, lowercase, number, and special character</span>
          </p>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
          Confirm New Password
        </Label>
        <div className="relative group">
          <Input
            id="confirmPassword"
            type={showPassword.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
            className={`pr-11 h-11 rounded-lg border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                ? 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20'
                : ''
            }`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted rounded-md transition-colors"
            onClick={() => togglePasswordVisibility('confirm')}
          >
            {showPassword.confirm ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {passwordData.confirmPassword && passwordData.newPassword && (
          <div className="flex items-center gap-1.5 text-xs">
            {passwordData.newPassword === passwordData.confirmPassword ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600 font-medium">Passwords match</span>
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5 text-red-600" />
                <span className="text-red-600 font-medium">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error and Success Messages */}
      {passwordError && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-lg shadow-sm animate-in slide-in-from-left duration-300">
          <div className="flex items-start gap-3">
            <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800">{passwordError}</p>
          </div>
        </div>
      )}
      
      {passwordSuccess && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100/50 border-l-4 border-green-500 rounded-lg shadow-sm animate-in slide-in-from-left duration-300">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800">{passwordSuccess}</p>
          </div>
        </div>
      )}

      {/* Change Password Button */}
      <div className="pt-4">
        <Button 
          onClick={handleSubmit}
          variant="default"
          className="w-full h-12 gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
          disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          size="lg"
        >
          <Lock className="h-5 w-5" />
          Change Password
        </Button>
      </div>
      </div>
    </TooltipProvider>
  );
};

export default ChangePassword;
