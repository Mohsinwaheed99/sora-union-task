import React, { useState } from 'react';
import Input from '../Input';
import Button from '../Button';

const SignupForm = ({ onSubmit, isLoading }: { onSubmit: (data: { name: string; email: string; password: string; confirmPassword: string; avatar?: File }) => void; isLoading: boolean }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData });
  };

  return (
    <div className="space-y-6">
      <Input
        type="text"
        id="name"
        label="Full Name"
        placeholder="Enter your full name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Input
        type="email"
        id="email"
        label="Email Address"
        placeholder="Enter your email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <Input
        type="password"
        id="password"
        label="Password"
        placeholder="Create a password"
        required
        minLength={6}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <Input
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        loadingText="Creating Account..."
        className="w-full"
        onClick={handleSubmit}
      >
        Create Account
      </Button>
    </div>
  );
};


export default SignupForm;