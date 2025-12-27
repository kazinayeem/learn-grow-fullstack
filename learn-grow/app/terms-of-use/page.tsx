import React from "react";

async function fetchTermsHtml() {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
        const res = await fetch(`${base.replace(/\/$/, "")}/site-content/terms-of-use`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success && typeof json?.data?.content === "string") return json.data.content as string;
    } catch {}
    return "";
}

export default async function TermsOfUsePage() {
    const html = await fetchTermsHtml();
    if (html) {
        return (
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        );
    }
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-sm text-gray-500 mb-8">Last updated: December 9, 2025</p>

                <p className="mb-6">
                    Welcome to Learn & Grow! These Terms of Service ("Terms") govern your access to and use of our website, mobile application, and all related services (collectively, the "Platform"). By creating an account or using our Platform, you agree to be bound by these Terms.
                </p>

                <p className="mb-6 font-semibold">
                    PLEASE READ THESE TERMS CAREFULLY BEFORE USING OUR PLATFORM. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE OUR SERVICES.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-6">
                    By accessing or using Learn & Grow, you confirm that you:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Are at least 13 years old (parental consent required for users under 18)</li>
                    <li>Have the legal capacity to enter into a binding agreement</li>
                    <li>Agree to comply with all applicable laws and regulations</li>
                    <li>Agree to our Privacy Policy and Cookie Policy</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Account Registration and Security</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Account Creation</h3>
                <p className="mb-4">To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your information to keep it accurate</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                    <li>Be responsible for all activities that occur under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Account Types</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>Student Account:</strong> For individuals taking courses</li>
                    <li><strong>Instructor Account:</strong> For qualified individuals teaching courses (requires verification)</li>
                    <li><strong>Guardian Account:</strong> For parents/guardians monitoring student progress</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Account Termination</h3>
                <p className="mb-4">We reserve the right to suspend or terminate your account if you:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Violate these Terms</li>
                    <li>Engage in fraudulent or illegal activities</li>
                    <li>Harass other users or instructors</li>
                    <li>Attempt to circumvent payment systems</li>
                    <li>Share or sell your account access</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Course Enrollment and Access</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Course Purchase</h3>
                <p className="mb-4">When you purchase a course:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>You receive a license to access the course content for personal, non-commercial use</li>
                    <li>Access is typically granted for the lifetime of the course</li>
                    <li>Prices are listed in Bangladeshi Taka (BDT) unless otherwise stated</li>
                    <li>All sales are final unless covered by our Refund Policy</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Course Access Rights</h3>
                <p className="mb-4">Your course access includes:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>✅ Video lectures and written content</li>
                    <li>✅ Quizzes and assignments</li>
                    <li>✅ Downloadable resources (PDFs, code files, etc.)</li>
                    <li>✅ Certificate upon successful completion</li>
                    <li>✅ Access to course discussion forums</li>
                    <li>❌ Resale or redistribution of course materials</li>
                    <li>❌ Sharing account credentials with others</li>
                    <li>❌ Commercial use of course content</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Course Completion and Certificates</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>You must complete all course modules and pass required quizzes to earn a certificate</li>
                    <li>Certificates are issued digitally and can be downloaded or shared</li>
                    <li>We reserve the right to revoke certificates if cheating or misconduct is detected</li>
                    <li>Certificates do not guarantee employment or professional certification</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Payment and Billing</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Accepted Payment Methods</h3>
                <p className="mb-4">We accept the following payment methods in Bangladesh:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>bKash Mobile Banking</li>
                    <li>Nagad Mobile Banking</li>
                    <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
                    <li>SSLCommerz payment gateway</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Pricing and Taxes</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>All prices are in Bangladesh Taka (BDT)</li>
                    <li>Prices may be subject to applicable taxes and fees</li>
                    <li>We reserve the right to change course prices at any time</li>
                    <li>Price changes do not affect courses already purchased</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Payment Processing</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Payments are processed securely through third-party payment gateways</li>
                    <li>We do not store your complete credit card information</li>
                    <li>Payment confirmation may take up to 24 hours</li>
                    <li>Failed payments will result in course access being denied until payment is successful</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.4 Billing Issues</h3>
                <p className="mb-4">
                    If you experience any billing issues or unauthorized charges, contact us immediately at <a href="mailto:billing@learnandgrow.io" className="text-primary hover:underline">billing@learnandgrow.io</a> within 30 days of the transaction.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Refund Policy</h2>
                <p className="mb-4">
                    We offer a <strong>7-day money-back guarantee</strong> for most courses. To be eligible for a refund:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>You must request a refund within 7 days of purchase</li>
                    <li>You must have completed less than 30% of the course content</li>
                    <li>You must not have downloaded the certificate</li>
                    <li>The request must be made via email to refunds@learnandgrow.io</li>
                </ul>

                <p className="mb-6">
                    <strong>Non-refundable items:</strong>
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Courses marked as "non-refundable" at time of purchase</li>
                    <li>Courses completed more than 30%</li>
                    <li>Purchased more than 7 days ago</li>
                    <li>Certificates already downloaded</li>
                </ul>

                <p className="mb-6">
                    Approved refunds will be processed within 7-14 business days to the original payment method. See our full <a href="/refund-policy" className="text-primary hover:underline">Refund Policy</a> for details.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Intellectual Property Rights</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Our Content</h3>
                <p className="mb-4">All content on the Platform, including but not limited to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Course videos, lectures, and presentations</li>
                    <li>Text, graphics, logos, and images</li>
                    <li>Software and code</li>
                    <li>Trademarks and branding</li>
                </ul>
                <p className="mb-6">
                    ...is owned by Learn & Grow or our content providers and is protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Limited License</h3>
                <p className="mb-4">We grant you a limited, non-exclusive, non-transferable license to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>access and view course content for personal, non-commercial purposes</li>
                    <li>Download materials explicitly marked as downloadable for personal use</li>
                    <li>Share your certificate on professional networks (LinkedIn, etc.)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Prohibited Uses</h3>
                <p className="mb-4">You may NOT:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>❌ Copy, reproduce, or distribute course materials without permission</li>
                    <li>❌ Record, screenshot, or download course videos (unless explicitly allowed)</li>
                    <li>❌ Sell, resell, or commercially exploit any course content</li>
                    <li>❌ Modify, create derivative works, or reverse engineer platform code</li>
                    <li>❌ Remove copyright notices or watermarks</li>
                    <li>❌ Use content for training other AI or machine learning systems</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.4 User-Generated Content</h3>
                <p className="mb-4">By posting comments, forum posts, or other content, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content on the Platform.</p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. User Conduct and Prohibited Activities</h2>
                <p className="mb-4">You agree NOT to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Violate any laws or regulations</li>
                    <li>Harass, threaten, or abuse other users or instructors</li>
                    <li>Post offensive, discriminatory, or inappropriate content</li>
                    <li>Cheat on quizzes or assignments</li>
                    <li>Create fake accounts or impersonate others</li>
                    <li>Spam or post promotional content without permission</li>
                    <li>Attempt to hack, disrupt, or gain unauthorized access to the Platform</li>
                    <li>Use bots, scrapers, or automated tools</li>
                    <li>Share copyrighted material without permission</li>
                    <li>Engage in any activity that could harm the Platform or other users</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Disclaimers</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.1 No Guarantee of Results</h3>
                <p className="mb-6">
                    While we strive to provide high-quality education, we do not guarantee:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Employment, job placement, or career advancement</li>
                    <li>Specific learning outcomes or skill proficiency</li>
                    <li>Passing external certifications or exams</li>
                    <li>Financial success or salary increases</li>
                </ul>
                <p className="mb-6">Your results depend on your effort, dedication, and individual circumstances.</p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.2 Platform Availability</h3>
                <p className="mb-6">
                    We do not guarantee uninterrupted access to the Platform. The Platform may be unavailable due to:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Scheduled maintenance</li>
                    <li>Technical issues or server outages</li>
                    <li>Force majeure events (natural disasters, etc.)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.3 Third-Party Content</h3>
                <p className="mb-6">
                    Courses may include links to third-party resources. We are not responsible for the accuracy, legality, or content of external sites.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Limitation of Liability</h2>
                <p className="mb-6">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEARN & GROW, ITS DIRECTORS, EMPLOYEES, AND PARTNERS SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Any indirect, incidental, special, or consequential damages</li>
                    <li>Loss of profits, data, or goodwill</li>
                    <li>Service interruptions or data loss</li>
                    <li>Actions of third-party service providers</li>
                    <li>User-generated content or conduct of other users</li>
                </ul>
                <p className="mb-6">
                    OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC COURSE IN QUESTION.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Indemnification</h2>
                <p className="mb-6">
                    You agree to indemnify and hold harmless Learn & Grow from any claims, damages, losses, liabilities, and expenses arising from:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any law or third-party rights</li>
                    <li>Your use of the Platform</li>
                    <li>Your user-generated content</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Changes to Services and Terms</h2>
                <p className="mb-4">We reserve the right to:</p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Modify or discontinue any part of the Platform</li>
                    <li>Update course content at any time</li>
                    <li>Change these Terms with 30 days' notice</li>
                    <li>Adjust pricing for future course purchases</li>
                </ul>
                <p className="mb-6">
                    Continued use of the Platform after changes constitutes acceptance of the updated Terms.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">12. Dispute Resolution</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.1 Governing Law</h3>
                <p className="mb-6">
                    These Terms shall be governed by and construed in accordance with the laws of Bangladesh.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.2 Informal Resolution</h3>
                <p className="mb-6">
                    Before Filing any legal action, you agree to first contact us at <a href="mailto:legal@learnandgrow.io" className="text-primary hover:underline">legal@learnandgrow.io</a> to attempt to resolve the dispute informally.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.3 Jurisdiction</h3>
                <p className="mb-6">
                    Any disputes shall be resolved in the courts of Dhaka, Bangladesh.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">13. Miscellaneous</h2>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.1 Entire Agreement</h3>
                <p className="mb-4">These Terms, along with our Privacy Policy and Refund Policy, constitute the entire agreement between you and Learn & Grow.</p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.2 Severability</h3>
                <p className="mb-4">If any provision of these Terms is found invalid, the remaining provisions shall remain in full effect.</p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.3 Waiver</h3>
                <p className="mb-4">Our failure to enforce any right or provision does not constitute a waiver of that right.</p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.4 Assignment</h3>
                <p className="mb-4">You may not transfer your rights under these Terms. We may assign our rights to any affiliate or successor.</p>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">14. Contact Information</h2>
                <p className="mb-4">For questions about these Terms, please contact us:</p>

                <div className="bg-gray-50 p-6 rounded-lg mt-6 mb-8">
                    <p className="mb-2"><strong>Learn & Grow</strong></p>
                    <p className="mb-2"><strong>General Inquiries:</strong> <a href="mailto:support@learnandgrow.io" className="text-primary hover:underline">support@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Legal:</strong> <a href="mailto:legal@learnandgrow.io" className="text-primary hover:underline">legal@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Billing:</strong> <a href="mailto:billing@learnandgrow.io" className="text-primary hover:underline">billing@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Refunds:</strong> <a href="mailto:refunds@learnandgrow.io" className="text-primary hover:underline">refunds@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Website:</strong> <a href="https://learnandgrow.io" className="text-primary hover:underline">learnandgrow.io</a></p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
                    <p className="font-semibold mb-2">✓ By using Learn & Grow, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
                    <p className="text-sm">Last Updated: December 9, 2025</p>
                </div>
            </div>
        </div>
    );
}
