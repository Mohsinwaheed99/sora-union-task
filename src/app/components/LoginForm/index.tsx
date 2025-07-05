import React, { useState } from 'react';
import Input from '../Input';
import Button from '../Button';

const LoginForm = ({ onSubmit, isLoading }: { onSubmit: (data: { email: string; password: string }) => void; isLoading: boolean }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        placeholder="Enter your password"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        loadingText="Signing In..."
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;