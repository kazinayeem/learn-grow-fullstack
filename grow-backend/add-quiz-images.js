const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/learn-grow-academy';

const quizQuestionSchema = new mongoose.Schema({
    questionText: String,
    questionImage: String,
    questionType: String,
    options: [{
        text: String,
        imageUrl: String,
        isCorrect: Boolean,
    }],
    correctAnswer: String,
    points: Number,
    explanation: String,
    order: Number,
}, { _id: true });

const quizSchema = new mongoose.Schema({
    assessmentId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
    createdBy: mongoose.Schema.Types.ObjectId,
    assessmentType: String,
    title: String,
    description: String,
    questions: [quizQuestionSchema],
    duration: Number,
    passingScore: Number,
    totalPoints: Number,
    shuffleQuestions: Boolean,
    shuffleOptions: Boolean,
    showCorrectAnswers: Boolean,
    status: String,
    totalAttempts: Number,
    attemptCount: Number,
    submissionsCount: Number,
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

async function addImagesToQuiz() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const quizId = '69594a34f4651942948b4c87';
        
        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            console.log('Quiz not found');
            return;
        }

        console.log(`Found quiz: ${quiz.title}`);
        console.log(`Questions: ${quiz.questions.length}`);

        // Add demo images to all options
        const demoImages = [
            'https://picsum.photos/300/200?random=1',
            'https://picsum.photos/300/200?random=2',
            'https://picsum.photos/300/200?random=3',
            'https://picsum.photos/300/200?random=4',
        ];

        quiz.questions.forEach((question, qIndex) => {
            if (question.questionType === 'multiple-choice' && question.options) {
                console.log(`\nQuestion ${qIndex + 1}: ${question.questionText}`);
                question.options.forEach((option, oIndex) => {
                    option.imageUrl = demoImages[oIndex % demoImages.length];
                    console.log(`  Option ${oIndex + 1}: "${option.text}" -> ${option.imageUrl}`);
                });
            }
        });

        // Save the updated quiz
        await quiz.save();
        console.log('\n✅ Quiz updated successfully with option images!');
        console.log(`\nView the quiz at: http://localhost:3000/quiz/${quizId}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addImagesToQuiz();
