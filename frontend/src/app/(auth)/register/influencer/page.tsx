'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import api from '@/lib/api';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Basic Info
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  username: string;

  // Step 2: Profile Details
  bio: string;
  location: string;
  languages: string[];
  categories: string[];

  // Step 3: Social Media
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;

  // Step 4: Pricing
  minPrice: number;
  maxPrice: number;
}

export default function InfluencerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    bio: '',
    location: '',
    languages: [],
    categories: [],
    minPrice: 10,
    maxPrice: 100,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.fullName || !formData.username) {
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
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.bio || formData.bio.length < 20) {
        setError('Bio must be at least 20 characters');
        return false;
      }
      if (!formData.location) {
        setError('Please enter your location');
        return false;
      }
      if (formData.categories.length === 0) {
        setError('Please select at least one category');
        return false;
      }
    }

    if (currentStep === 3) {
      const hasSocialMedia = formData.instagram || formData.facebook ||
                            formData.twitter || formData.youtube || formData.tiktok;
      if (!hasSocialMedia) {
        setError('Please connect at least one social media account');
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
        role: 'influencer',
      });

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel',
    'Technology', 'Gaming', 'Lifestyle', 'Music', 'Art'
  ];

  const languages = [
    'English', 'Persian', 'Spanish', 'French', 'Arabic',
    'German', 'Portuguese', 'Chinese', 'Korean', 'Japanese'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Register as Influencer
          </h1>
          <p className="text-gray-600">Step {currentStep} of 4</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  step <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
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
                    label="Full Name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Elon Musk"
                  />

                  <Input
                    label="Username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => updateFormData('username', e.target.value)}
                    placeholder="elonmusk"
                    helperText="This will be your unique identifier on the platform"
                  />

                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="elon@example.com"
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

              {/* Step 2: Profile Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile Details
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.bio}
                      onChange={(e) => updateFormData('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Tell us about yourself and your content..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 20 characters
                    </p>
                  </div>

                  <Input
                    label="Location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="City, Country"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Categories <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('categories', [...formData.categories, category]);
                              } else {
                                updateFormData('categories', formData.categories.filter(c => c !== category));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((language) => (
                        <label
                          key={language}
                          className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.languages.includes(language)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('languages', [...formData.languages, language]);
                              } else {
                                updateFormData('languages', formData.languages.filter(l => l !== language));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Social Media */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Connect Social Media
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect at least one social media account to verify your influence
                  </p>

                  <Input
                    label="Instagram Username"
                    type="text"
                    value={formData.instagram || ''}
                    onChange={(e) => updateFormData('instagram', e.target.value)}
                    placeholder="@username"
                  />

                  <Input
                    label="Facebook Page"
                    type="text"
                    value={formData.facebook || ''}
                    onChange={(e) => updateFormData('facebook', e.target.value)}
                    placeholder="facebook.com/yourpage"
                  />

                  <Input
                    label="Twitter/X Username"
                    type="text"
                    value={formData.twitter || ''}
                    onChange={(e) => updateFormData('twitter', e.target.value)}
                    placeholder="@username"
                  />

                  <Input
                    label="YouTube Channel"
                    type="text"
                    value={formData.youtube || ''}
                    onChange={(e) => updateFormData('youtube', e.target.value)}
                    placeholder="youtube.com/c/yourchannel"
                  />

                  <Input
                    label="TikTok Username"
                    type="text"
                    value={formData.tiktok || ''}
                    onChange={(e) => updateFormData('tiktok', e.target.value)}
                    placeholder="@username"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You'll need to verify your accounts after registration
                      by posting a verification code provided by our platform.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Pricing */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Set Your Pricing
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Set your minimum and maximum price range for collaborations (in USDT)
                  </p>

                  <Input
                    label="Minimum Price (USDT)"
                    type="number"
                    required
                    min="1"
                    value={formData.minPrice}
                    onChange={(e) => updateFormData('minPrice', parseFloat(e.target.value))}
                  />

                  <Input
                    label="Maximum Price (USDT)"
                    type="number"
                    required
                    min={formData.minPrice}
                    value={formData.maxPrice}
                    onChange={(e) => updateFormData('maxPrice', parseFloat(e.target.value))}
                  />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Platform Commission:</strong> 20%
                    </p>
                    <p className="text-xs text-green-700">
                      You'll receive 80% of the project payment. For example, if you earn $100,
                      you'll receive $80 after platform commission.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Ready to get started?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Browse thousands of projects</li>
                      <li>✓ Apply to campaigns that match your profile</li>
                      <li>✓ Get paid in cryptocurrency (USDT)</li>
                      <li>✓ Build your portfolio and grow your audience</li>
                    </ul>
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

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
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
                  className="text-primary-600 hover:text-primary-700 font-medium"
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
