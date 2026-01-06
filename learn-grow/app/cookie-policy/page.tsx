import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies on our platform',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Cookie Policy
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <strong>Last Updated:</strong> January 6, 2026
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This Cookie Policy explains how our platform uses cookies and similar technologies 
              to recognize you when you visit our website. It explains what these technologies are 
              and why we use them, as well as your rights to control our use of them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              What are cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Cookies are small data files that are placed on your computer or mobile device when 
              you visit a website. Cookies are widely used by website owners to make their websites 
              work, or to work more efficiently, as well as to provide reporting information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Why do we use cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies for several reasons:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the website to 
                function properly. They enable basic functions like page navigation, access to secure 
                areas, and authentication.
              </li>
              <li>
                <strong>Performance Cookies:</strong> These cookies help us understand how visitors 
                interact with our website by collecting and reporting information anonymously.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> These cookies enable the website to provide 
                enhanced functionality and personalization, such as remembering your preferences.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> We use these cookies to analyze website traffic 
                and usage patterns to improve our services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Types of cookies we use
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  1. Session Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These are temporary cookies that remain in your browser until you leave the website. 
                  They help maintain your session and ensure a seamless experience.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  2. Persistent Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies remain on your device for a set period or until you delete them. 
                  They help us remember your preferences and settings for future visits.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  3. Authentication Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies authenticate users and prevent fraudulent use of login credentials. 
                  They are essential for maintaining your logged-in state.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  4. Preference Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies remember information about your preferences, such as language, 
                  region, or theme settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Third-party cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              In addition to our own cookies, we may also use various third-party cookies to report 
              usage statistics, deliver advertisements, and improve our services. These include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li>Analytics services (e.g., Google Analytics)</li>
              <li>Payment processing services</li>
              <li>Social media integration</li>
              <li>Content delivery networks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              How can you control cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to decide whether to accept or reject cookies. You can exercise 
              your cookie preferences by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Setting your browser preferences to accept or reject cookies</li>
              <li>Deleting cookies that have already been set</li>
              <li>Using browser plugins that manage cookies</li>
              <li>Visiting our website settings to manage your preferences</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Please note that if you choose to reject cookies, you may not be able to use all 
              features of our website, and some functionality may be limited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Browser-specific settings
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Most web browsers allow you to control cookies through their settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Updates to this policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We encourage you to review 
              this policy periodically to stay informed about our use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Contact us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about our use of cookies or this Cookie Policy, please 
              contact us through our website's contact page or support channels.
            </p>
          </section>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> By continuing to use our website, you acknowledge that you 
              have read and understood this Cookie Policy and consent to our use of cookies as 
              described herein.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
