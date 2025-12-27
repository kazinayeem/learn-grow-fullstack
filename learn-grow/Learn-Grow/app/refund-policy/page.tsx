import React from "react";

export default function RefundPolicyPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Refund Policy / রিফান্ড পলিসি</h1>
            <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-sm text-gray-500 mb-8">Last updated: December 9, 2025</p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
                    <p className="font-semibold text-lg mb-2">আমাদের রিফান্ড পলিসি খুবই সিম্পল।</p>
                    <p className="text-sm">Our refund policy is very simple.</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">রিফান্ড পলিসি (Refund Policy)</h2>

                <div className="space-y-6">
                    <div className="border-l-4 border-primary-500 pl-6 py-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">১. সময়সীমা (Time Limit)</h3>
                        <p className="mb-2 font-siliguri text-lg">
                            কোর্স পারচেজ করার <strong>৪৮ ঘন্টার মধ্যে</strong> আপনি রিফান্ড রিকোয়েস্ট করতে পারবেন।
                        </p>
                        <p className="text-gray-600">
                            You can request a refund <strong>within 48 hours</strong> of purchasing the course.
                        </p>
                    </div>

                    <div className="border-l-4 border-primary-500 pl-6 py-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">২. রিকোয়েস্ট প্রক্রিয়া (Request Process)</h3>
                        <p className="mb-2 font-siliguri text-lg">
                            রিফান্ড রিকোয়েস্টের জন্য <strong>refunds@learnandgrow.io</strong> এ বিস্তারিত লিখে ইমেইল করুন।
                        </p>
                        <p className="text-gray-600">
                            For refund requests, send a detailed email to <a href="mailto:refunds@learnandgrow.io" className="text-primary hover:underline">refunds@learnandgrow.io</a>
                        </p>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p className="font-semibold mb-2">ইমেইলে অন্তর্ভুক্ত করুন:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>আপনার নাম ও রেজিস্টার্ড ইমেইল</li>
                                <li>কোর্সের নাম</li>
                                <li>পারচেজ তারিখ ও Transaction ID</li>
                                <li>রিফান্ড চাওয়ার কারণ</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-l-4 border-primary-500 pl-6 py-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">৩. রেস্পন্স সময় (Response Time)</h3>
                        <p className="mb-2 font-siliguri text-lg">
                            ইমেইল করার পর <strong>৪৮ ঘণ্টার মধ্যে</strong> রেস্পন্স করা হবে এবং আরও বিস্তারিত কিছু তথ্য জানতে চাওয়া হবে।
                        </p>
                        <p className="text-gray-600">
                            We will respond <strong>within 48 hours</strong> after receiving your email and may request additional information.
                        </p>
                    </div>

                    <div className="border-l-4 border-primary-500 pl-6 py-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">৪. প্রসেসিং সময় (Processing Time)</h3>
                        <p className="mb-2 font-siliguri text-lg">
                            আমাদের মূল ফোকাস যেহেতু শেখানোর ক্ষেত্রে, তাই কোনো রিফান্ড রিকোয়েস্ট প্রসেস হতে <strong>৪-৬ দিন</strong> সময়ও প্রয়োজন হতে পারে।
                        </p>
                        <p className="text-gray-600">
                            Since our main focus is on teaching, refund requests may take <strong>4-6 business days</strong> to process.
                        </p>
                    </div>

                    <div className="border-l-4 border-red-500 pl-6 py-2 bg-red-50">
                        <h3 className="text-xl font-bold text-red-800 mb-2">৫. গুরুত্বপূর্ণ শর্ত (Important Condition)</h3>
                        <p className="mb-2 font-siliguri text-lg text-red-700">
                            আমরা যেহেতু ব্যাচ সিস্টেমে কাজ করি, তাই কোনো কোর্সের <strong>ওরিয়েন্টেশন শুরু হয়ে গেলে</strong> আমরা মূলত কোর্সে শেখানোর দিকেই ফোকাস করে থাকি এবং এরপর আর রিফান্ড রিকোয়েস্ট একসেপ্ট করা হয় না।
                        </p>
                        <p className="text-red-600">
                            Since we work in a batch system, <strong>once a course orientation has started</strong>, we focus primarily on teaching, and refund requests are no longer accepted after this point.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Non-Refundable Situations</h2>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>After course orientation or first live class has started</li>
                    <li>After 48 hours from purchase date</li>
                    <li>If more than 30% of course content has been accessed</li>
                    <li>If certificate has been downloaded</li>
                    <li>Courses marked as "non-refundable" at time of purchase</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Refund Method / রিফান্ড পদ্ধতি</h2>
                <p className="mb-4 font-siliguri">
                    অনুমোদিত রিফান্ডগুলো আপনার মূল পেমেন্ট পদ্ধতিতে ফেরত দেওয়া হবে:
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>bKash:</strong> 3-5 business days</li>
                    <li><strong>Nagad:</strong> 3-5 business days</li>
                    <li><strong>Credit/Debit Card:</strong> 7-14 business days (depending on bank)</li>
                    <li><strong>Bank Transfer:</strong> 5-7 business days</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contact for Refunds</h2>
                <div className="bg-gray-50 p-6 rounded-lg mt-6 mb-8">
                    <p className="mb-2"><strong>Refund Department</strong></p>
                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:refunds@learnandgrow.io" className="text-primary hover:underline">refunds@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Support:</strong> <a href="mailto:support@learnandgrow.io" className="text-primary hover:underline">support@learnandgrow.io</a></p>
                    <p className="mb-2"><strong>Phone:</strong> +880-XXXX-XXXXXX (Business hours: 10 AM - 6 PM, Sat-Thu)</p>
                    <p className="mb-2"><strong>Response Time:</strong> Within 48 hours</p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mt-8">
                    <p className="font-semibold mb-2">⚠️ দয়া করে মনে রাখবেন:</p>
                    <p className="font-siliguri">
                        রিফান্ড পলিসি সম্পর্কিত Learn & Grow কর্তৃপক্ষের সিদ্ধান্তই চূড়ান্ত এবং যেকোনো সময় তা পরিবর্তনের ক্ষমতা কর্তৃপক্ষের রয়েছে।
                    </p>
                    <p className="text-sm mt-2">
                        The decision of Learn & Grow management regarding refund policy is final, and the management reserves the right to change it at any time.
                    </p>
                </div>
            </div>
        </div>
    );
}
