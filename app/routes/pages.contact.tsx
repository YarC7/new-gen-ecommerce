import {useState} from 'react';
import {Form, useActionData, useNavigation} from 'react-router';
import {data, type ActionFunctionArgs} from '@shopify/remix-oxygen';

export async function action({request}: ActionFunctionArgs) {
  const form = await request.formData();
  const fullName = String(form.get('fullName') || '');
  const workEmail = String(form.get('workEmail') || '');
  const company = String(form.get('company') || '');
  const projectType = String(form.get('projectType') || '');
  const techStack = String(form.get('techStack') || '');
  const budgetRange = String(form.get('budgetRange') || '');
  const timeline = String(form.get('timeline') || '');
  const projectDescription = String(form.get('projectDescription') || '');

  if (!fullName || !workEmail || !projectDescription) {
    return data({error: 'Full name, work email, and project description are required'}, {status: 400});
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(workEmail)) {
    return data({error: 'Please enter a valid email address'}, {status: 400});
  }

  try {
    console.log('Contact form submission:', {
      fullName,
      workEmail,
      company,
      projectType,
      techStack,
      budgetRange,
      timeline,
      projectDescription
    });

    return {
      success: "Thank you for your request! A solutions architect will reach out within one business day.",
    };
  } catch (error) {
    return data(
      {error: 'Failed to send message. Please try again.'},
      {status: 500},
    );
  }
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Contact With Us
          </h1>
          <p className="text-gray-600">
            Tell us about your project and a solutions architect will reach out within one business day.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <Form method="post" className="space-y-6">
            {actionData && 'error' in actionData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{actionData.error}</p>
              </div>
            )}

            {actionData && 'success' in actionData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">{actionData.success}</p>
              </div>
            )}

            {/* Full Name and Work Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm text-gray-600 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="workEmail" className="block text-sm text-gray-600 mb-2">
                  Work email
                </label>
                <input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Company and Project Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="company" className="block text-sm text-gray-600 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-sm text-gray-600 mb-2">
                  Project type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select project type</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Tech Stack and Budget Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="techStack" className="block text-sm text-gray-600 mb-2">
                  Tech stack (e.g., AWS, GCP, K8s)
                </label>
                <input
                  type="text"
                  id="techStack"
                  name="techStack"
                  placeholder="e.g., AWS, GCP, K8s"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="budgetRange" className="block text-sm text-gray-600 mb-2">
                  Budget range
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="over-100k">Over $100,000</option>
                </select>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm text-gray-600 mb-2">
                Timeline
              </label>
              <select
                id="timeline"
                name="timeline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select timeline</option>
                <option value="asap">ASAP</option>
                <option value="1-3-months">1-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="6-12-months">6-12 months</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="projectDescription" className="block text-sm text-gray-600 mb-2">
                Tell us about your project
              </label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                rows={6}
                required
                placeholder="Describe your project requirements, goals, and any specific needs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree to our terms and privacy policy.
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
