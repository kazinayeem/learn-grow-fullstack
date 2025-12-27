"use client";
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function FAQPage() {
    const faqs = [
        {
            question: "How do I enroll in a course?",
            answer: "Simply navigate to the Courses page, browse our selection, and click on any course you're interested in. On the course details page, click the 'Enroll' or 'Buy Now' button to get started."
        },
        {
            question: "Are the courses self-paced?",
            answer: "Yes! Most of our courses are self-paced, allowing you to learn at your own speed. Some advanced bootcamps may have live sessions which will be scheduled in advance."
        },
        {
            question: "Do I get a certificate after completion?",
            answer: "Absolutely. Upon successfully completing all modules and quizzes of a paid course, you will receive a verifiable digital certificate."
        },
        {
            question: "Can I access the courses on mobile?",
            answer: "Yes, our platform is fully responsive and works great on smartphones and tablets, so you can learn on the go."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept major credit cards, debit cards, and mobile banking payment methods commonly used in Bangladesh."
        },
        {
            question: "Is there a refund policy?",
            answer: "We offer a 7-day money-back guarantee if you are not satisfied with the course content, provided you haven't completed more than 30% of the course."
        }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h1>
                <p className="text-gray-600">Find answers to common questions about our platform and courses.</p>
            </div>

            <Accordion variant="splitted" className="gap-4">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        aria-label={faq.question}
                        title={<span className="font-semibold text-lg">{faq.question}</span>}
                        className="shadow-sm border border-gray-100"
                    >
                        <div className="text-gray-600 pb-4">
                            {faq.answer}
                        </div>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
