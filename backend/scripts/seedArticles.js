const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Article = require('../models/Article');
const { buildArticleTrie } = require('../utils/trie/articleTrie');

dotenv.config();

const articles = [
  {
    title: 'Understanding PCOS Symptoms',
    slug: 'understanding-pcos-symptoms',
    category: 'PCOS',
    summary:
      'Learn common PCOS signs such as irregular periods, acne, hair changes, and hormone-related symptoms.',
    content:
      'PCOS can look different from person to person. Common signs include irregular periods, acne, increased facial hair, hair thinning, weight changes, and fatigue. These symptoms can overlap with other health conditions, so tracking patterns and speaking with a clinician can help you understand what is happening in your body.',
    coverImage: '/images/knowledge/pcos-symptoms.jpg',
    tags: ['pcos', 'hormones', 'symptoms'],
    keywords: ['irregular periods', 'acne', 'androgens', 'hormonal imbalance'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: true
  },
  {
    title: 'PCOS Nutrition Basics',
    slug: 'pcos-nutrition-basics',
    category: 'PCOS',
    summary:
      'A practical guide to balanced meals, fiber, protein, and insulin-friendly habits for PCOS care.',
    content:
      'Nutrition for PCOS is not about restriction. A balanced plate with protein, fiber-rich carbohydrates, healthy fats, and colorful vegetables can support steadier energy and insulin response. Small consistent changes, such as regular meals and pairing carbohydrates with protein, are often more sustainable than strict plans.',
    coverImage: '/images/knowledge/pcos-nutrition.jpg',
    tags: ['pcos', 'nutrition', 'insulin resistance'],
    keywords: ['balanced meals', 'fiber', 'protein', 'metabolic health'],
    readingTime: 6,
    author: 'SheCare Nutrition Team',
    featured: true
  },
  {
    title: 'How to Track Your Menstrual Cycle',
    slug: 'how-to-track-your-menstrual-cycle',
    category: 'Menstrual Health',
    summary:
      'Track dates, symptoms, flow, mood, and pain levels to understand your cycle patterns over time.',
    content:
      'Cycle tracking works best when it is simple and consistent. Record your period start date, flow, cramps, mood, sleep, discharge changes, and energy levels. Over several cycles, these notes can reveal patterns that help you prepare for symptoms and share clearer information with your healthcare provider.',
    coverImage: '/images/knowledge/cycle-tracking.jpg',
    tags: ['cycle tracking', 'periods', 'symptoms'],
    keywords: ['menstrual cycle', 'period tracking', 'flow', 'cramps'],
    readingTime: 4,
    author: 'SheCare Wellness Team',
    featured: false
  },
  {
    title: 'Irregular Periods: When to Seek Care',
    slug: 'irregular-periods-when-to-seek-care',
    category: 'Menstrual Health',
    summary:
      'Understand common causes of irregular periods and signs that deserve a healthcare conversation.',
    content:
      'Irregular periods can happen because of stress, weight changes, thyroid conditions, PCOS, intense exercise, medications, or life transitions. Seek care if periods stop for several months, bleeding is very heavy, pain is severe, or cycle changes are sudden and persistent.',
    coverImage: '/images/knowledge/irregular-periods.jpg',
    tags: ['irregular periods', 'cycle health', 'pcos'],
    keywords: ['amenorrhea', 'heavy bleeding', 'thyroid', 'stress'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: true
  },
  {
    title: 'Hormonal Acne and Cycle Changes',
    slug: 'hormonal-acne-and-cycle-changes',
    category: 'Skin & Hormones',
    summary:
      'Explore why acne may flare around cycle changes and how hormone patterns can affect skin.',
    content:
      'Hormonal acne often appears along the jawline, chin, or lower face and may flare before periods. Shifts in androgens, stress hormones, sleep, and insulin can affect oil production and inflammation. Gentle skincare, cycle tracking, and medical guidance can help identify the right care plan.',
    coverImage: '/images/knowledge/hormonal-acne.jpg',
    tags: ['acne', 'hormones', 'skin'],
    keywords: ['androgens', 'jawline acne', 'cycle flare', 'inflammation'],
    readingTime: 4,
    author: 'SheCare Dermatology Education',
    featured: false
  },
  {
    title: 'Stress, Sleep, and Hormone Balance',
    slug: 'stress-sleep-and-hormone-balance',
    category: 'Lifestyle',
    summary:
      'See how stress and sleep can influence cycle symptoms, cravings, energy, and hormone rhythms.',
    content:
      'Stress and poor sleep can affect cortisol, appetite signals, insulin sensitivity, and cycle symptoms. Supportive routines such as consistent sleep timing, light movement, calming wind-down habits, and realistic boundaries can make hormone-related symptoms easier to manage.',
    coverImage: '/images/knowledge/stress-sleep.jpg',
    tags: ['stress', 'sleep', 'hormones'],
    keywords: ['cortisol', 'insulin sensitivity', 'rest', 'lifestyle'],
    readingTime: 5,
    author: 'SheCare Wellness Team',
    featured: false
  }
];

const seedArticles = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shecare';

  try {
    await mongoose.connect(mongoUri);
    await Article.deleteMany({
      slug: {
        $in: articles.map((article) => article.slug)
      }
    });
    await Article.insertMany(articles);
    await buildArticleTrie();
    console.log(`Seeded ${articles.length} articles and rebuilt article trie.`);
  } catch (error) {
    console.error(`Article seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedArticles();
