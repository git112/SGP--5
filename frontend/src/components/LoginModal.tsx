import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { validateCharusatEmail, getEmailValidationMessage, getEmailExamples } from "@/utils/emailValidation";
 
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  // Debug logging
  console.log('LoginModal rendered, open:', open);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [isSignupOTP, setIsSignupOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const { login, signup, verifySignup, sendOTP, resetPasswordWithOTP } = useAuth();
  const navigate = useNavigate();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmNewPasswordRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  // OTP Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval as number);
    };
  }, [otpTimer]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (showOTPVerification && otpRef.current) {
          otpRef.current.focus();
        } else if (showResetPassword && newPasswordRef.current) {
          newPasswordRef.current.focus();
        } else if (showForgotPassword && forgotEmailRef.current) {
          forgotEmailRef.current.focus();
        } else if (emailRef.current) {
          emailRef.current.focus();
        }
      }, 100);
    }
  }, [open, showOTPVerification, showResetPassword, showForgotPassword]);

  // Removed Google OAuth initialization

  // No token-based reset in UI; using OTP-based reset flow

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailError("");
    setLoading(true);
    
    // Validate email format before submission
    if (!validateCharusatEmail(email)) {
      setEmailError(getEmailValidationMessage());
      setLoading(false);
      return;
    }
    
    try {
      if (isSignUp) {
        // For signup, send OTP for email verification
        const otpResult = await signup(email, password);
        setMaskedEmail(otpResult.masked_email);
        setOtpExpiresIn(otpResult.expires_in);
        setOtpTimer(otpResult.expires_in);
        setIsSignupOTP(true);
        setShowOTPVerification(true);
        setSuccess(`OTP sent to ${otpResult.masked_email}`);
      } else {
        // For login, authenticate directly
        await login(email, password);
        setSuccess("Login successful!");
        setTimeout(() => {
          onClose();
          navigate("/insights");
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      if (isSignupOTP) {
        // For signup, verify OTP and complete registration
        const result = await verifySignup(email, password, otp);
        setSuccess("Account created successfully! You can now login with your email and password.");
        setTimeout(() => {
          onClose();
          navigate("/insights");
        }, 2000);
      } else {
        // Forgot password flow: OTP verification and prompt to reset
        setShowOTPVerification(false);
        setShowResetPassword(true);
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      let otpResult;
      if (isSignupOTP) {
        // For signup, use the signup endpoint
        otpResult = await signup(email, password);
      } else {
        // For forgot password flow, use the sendOTP endpoint
        otpResult = await sendOTP(email);
      }
      
      setMaskedEmail(otpResult.masked_email);
      setOtpExpiresIn(otpResult.expires_in);
      setOtpTimer(otpResult.expires_in);
      setSuccess(`New OTP sent to ${otpResult.masked_email}`);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow: email -> OTP -> reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailError("");
    setLoading(true);
    
    // Validate email format before submission
    if (!validateCharusatEmail(email)) {
      setEmailError(getEmailValidationMessage());
      setLoading(false);
      return;
    }
    
    try {
      const otpResult = await sendOTP(email);
      setMaskedEmail(otpResult.masked_email);
      setOtpExpiresIn(otpResult.expires_in);
      setOtpTimer(otpResult.expires_in);
      setIsSignupOTP(false);
      setShowForgotPassword(false);
      setShowOTPVerification(true);
      setSuccess(`OTP sent to ${otpResult.masked_email}`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      // Use OTP-based reset
      const message = await resetPasswordWithOTP(email, otp, newPassword);
      setSuccess(message || "Password reset successfully!");
      setTimeout(() => {
        setShowResetPassword(false);
        setShowForgotPassword(false);
        setNewPassword("");
        setConfirmNewPassword("");
        setOtp("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setMaskedEmail("");
    setOtpExpiresIn(0);
    setOtpTimer(0);
    setError("");
    setSuccess("");
    setEmailError("");
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setShowOTPVerification(false);
    setIsSignupOTP(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow form submission with Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      const form = e.currentTarget.closest('form');
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    }
  };

  if (showOTPVerification) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md card border-primary/20 slide-up login-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">
              {isSignupOTP ? "Complete Registration" : "Email Verification"}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {isSignupOTP 
                ? `Enter the 6-digit code sent to ${maskedEmail} to complete your registration`
                : `Enter the 6-digit code sent to ${maskedEmail}`
              }
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6 p-6" onSubmit={handleOTPVerification} onKeyDown={handleKeyDown}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  ref={otpRef}
                  tabIndex={1}
                  className="text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {otpTimer > 0 ? (
                    <span>Code expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                  ) : (
                    <span className="text-red-500">Code has expired</span>
                  )}
                </div>
              </div>
            </div>
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOTPVerification(false)}
                className="flex-1"
                disabled={loading}
                tabIndex={3}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || otp.length !== 6 || otpTimer === 0}
                tabIndex={2}
              >
                {loading 
                  ? (isSignupOTP ? "Creating Account..." : "Verifying...") 
                  : (isSignupOTP ? "Complete Registration" : "Verify & Login")
                }
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpTimer > 0}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded px-2 py-1 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={4}
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (showResetPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md card border-primary/20 slide-up login-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6 p-6" onSubmit={handleResetPassword} onKeyDown={handleKeyDown}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-foreground">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  tabIndex={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetOtp" className="text-foreground">OTP</Label>
                <Input
                  id="resetOtp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="text-center tracking-widest"
                  tabIndex={1}
                  placeholder="000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                    ref={newPasswordRef}
                    tabIndex={1}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded"
                    tabIndex={2}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                    ref={confirmNewPasswordRef}
                    tabIndex={3}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded"
                    tabIndex={4}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            {error && <div id="reset-password-error" className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}
            
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowResetPassword(false)}
                className="flex-1 transition-all duration-200 cursor-pointer active:scale-95"
                disabled={loading}
                tabIndex={5}
                style={{ pointerEvents: 'auto' }}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 transition-all duration-200 cursor-pointer active:scale-95" 
                disabled={loading} 
                tabIndex={6}
                style={{ pointerEvents: 'auto' }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (showForgotPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md card border-primary/20 slide-up login-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">
              Forgot Password
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Enter your email to receive a password reset link
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6 p-6" onSubmit={handleForgotPassword} onKeyDown={handleKeyDown}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail" className="text-foreground">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  ref={forgotEmailRef}
                  tabIndex={1}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
              </div>
            </div>
            
            {error && <div id="forgot-password-error" className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-500 text-sm text-center">{success}</div>}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
                disabled={loading}
                tabIndex={2}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading} tabIndex={3}>
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
              <DialogContent className="sm:max-w-md card border-primary/20 slide-up login-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {isSignUp ? "Create your account with CHARUSAT email (OTP verification required)" : "Sign in with your CHARUSAT email and password"}
            </DialogDescription>
          </DialogHeader>
        
        <form 
          className="space-y-6 p-6" 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            console.log('Form clicked at:', e.target);
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  ref={emailRef}
                  className={`pl-10 ${emailError ? "border-red-500" : ""}`}
                  tabIndex={1}
                  aria-describedby="login-error"
                  autoComplete="email"
                />
              </div>
              {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
              <div className="text-xs text-gray-500">
                <div className="mb-1">Valid formats:</div>
                <div>Any email ending with @charusat.edu.in or @charusat.ac.in</div>
                <div>Examples: john@charusat.edu.in, mary@charusat.ac.in, 21it101@charusat.edu.in</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  ref={passwordRef}
                  className="pl-10 pr-10"
                  tabIndex={2}
                  aria-describedby="login-error"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded p-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    tabIndex={3}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ pointerEvents: 'auto' }}
                  >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10 pr-10"
                    ref={confirmPasswordRef}
                    tabIndex={4}
                    aria-describedby="confirm-password-error"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded p-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    tabIndex={5}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setShowForgotPassword(true); setShowOTPVerification(false); setShowResetPassword(false); setError(""); setSuccess(""); }}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded px-2 py-1 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                tabIndex={isSignUp ? 6 : 4}
                style={{ pointerEvents: 'auto' }}
              >
                Forgot your password?
              </button>
            </div>
          )}
          
          {error && <div id="login-error" className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}
          
          <Button 
            type="submit" 
            className="w-full transition-all duration-200 cursor-pointer active:scale-95 hover:shadow-lg" 
            disabled={loading}
            tabIndex={isSignUp ? 7 : 5}
            style={{ pointerEvents: 'auto' }}
          >
            {loading ? (isSignUp ? "Sending OTP..." : "Signing in...") : (isSignUp ? "Send OTP" : "Sign in")}
          </Button>
          
          {/* Removed Google OAuth UI */}
          
          <div className="text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 rounded px-1 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
              tabIndex={isSignUp ? 9 : 7}
              style={{ pointerEvents: 'auto' }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};