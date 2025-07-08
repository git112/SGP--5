import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// Backend API base URL (change as needed)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const endpoint = isSignUp ? "/signup" : "/login";
      const payload = isSignUp
        ? { email, password, confirm_password: confirmPassword }
        : { email, password };
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong");
      } else {
        setSuccess(data.message || (isSignUp ? "Signup successful" : "Login successful"));
        // Optionally close modal or reset fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        if (!isSignUp) {
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card border-primary/20 slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-6 p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-card border-border focus:border-primary rounded-2xl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="bg-card border-border focus:border-primary rounded-2xl"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-card border-border focus:border-primary rounded-2xl"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          {error && <div className="error text-center">{error}</div>}
          {success && <div className="success text-center">{success}</div>}
          <div className="space-y-4">
            <Button className="w-full btn-primary" type="submit" disabled={loading}>
              {loading ? (isSignUp ? "Creating..." : "Signing in...") : isSignUp ? "Create Account" : "Sign In"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 muted">Or</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-card rounded-2xl"
              type="button"
              disabled
            >
              {/* Google icon here */}
              Continue with Google
            </Button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="text-sm text-primary hover:underline transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};