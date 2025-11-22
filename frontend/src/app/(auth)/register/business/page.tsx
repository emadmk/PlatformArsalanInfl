'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import api from '@/lib/api';

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1: Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  contactName: string;

  // Step 2: Business Details
  industry: string;
  companySize: string;
  website?: string;
  description: string;
  location: string;

  // Step 3: Goals & Budget
  goals: string[];
  monthlyBudget: string;
  targetAudience: string;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactName: '',
    industry: '',
    companySize: '',
    description: '',
    location: '',
    goals: [],
    monthlyBudget: '',
    targetAudience: '',
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.companyName || !formData.contactName) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.industry || !formData.companySize || !formData.description || !formData.location) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.description.length < 30) {
        setError('Company description must be at least 30 characters');
        return false;
      }
    }

    if (currentStep === 3) {
      if (formData.goals.length === 0) {
        setError('Please select at least one goal');
        return false;
      }
      if (!formData.monthlyBudget) {
        setError('Please select your monthly budget range');
        return false;
      }
      if (!formData.targetAudience) {
        setError('Please describe your target audience');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', {
        ...formData,
        role: 'business',
      });

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to business dashboard
      router.push('/business/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    'E-commerce', 'Technology', 'Fashion', 'Beauty', 'Food & Beverage',
    'Travel & Tourism', 'Health & Fitness', 'Entertainment', 'Education', 'Other'
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  const marketingGoals = [
    'Brand Awareness',
    'Product Launch',
    'Lead Generation',
    'Sales Growth',
    'Social Media Growth',
    'Content Creation',
    'Event Promotion',
    'Reputation Management'
  ];

  const budgetRanges = [
    'Under $1,000/month',
    '$1,000 - $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000 - $25,000/month',
    '$25,000+/month'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-600 mb-2">
            Register as Business
          </h1>
          <p className="text-gray-600">Step {currentStep} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-secondary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h2>

                  <Input
                    label="Company Name"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Your Company Name"
                  />

                  <Input
                    label="Contact Person Name"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                    placeholder="John Doe"
                  />

                  <Input
                    label="Business Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your@company.com"
                  />

                  <Input
                    label="Password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="••••••••"
                    helperText="At least 8 characters"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Step 2: Business Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Business Details
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => updateFormData('industry', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.companySize}
                      onChange={(e) => updateFormData('companySize', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Company Size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                    helperText="Optional"
                  />

                  <Input
                    label="Location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="City, Country"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                      placeholder="Tell us about your company and what you do..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 30 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Goals & Budget */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Marketing Goals & Budget
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marketing Goals <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select all that apply
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {marketingGoals.map((goal) => (
                        <label
                          key={goal}
                          className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.goals.includes(goal)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('goals', [...formData.goals, goal]);
                              } else {
                                updateFormData('goals', formData.goals.filter(g => g !== goal));
                              }
                            }}
                            className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                          />
                          <span className="text-sm text-gray-700">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Marketing Budget <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.monthlyBudget}
                      onChange={(e) => updateFormData('monthlyBudget', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Budget Range</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.targetAudience}
                      onChange={(e) => updateFormData('targetAudience', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                      placeholder="Describe your target audience (age, location, interests, etc.)"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Create and manage influencer marketing campaigns</li>
                      <li>✓ Search and filter thousands of verified influencers</li>
                      <li>✓ Track campaign performance with detailed analytics</li>
                      <li>✓ Secure payments with cryptocurrency (USDT)</li>
                      <li>✓ Direct communication with influencers via chat</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Platform Fee:</strong> 20% commission on all completed projects
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="secondary"
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
