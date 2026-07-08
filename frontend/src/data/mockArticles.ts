import { Article } from "../services/article.service";

export const MOCK_ARTICLES: Article[] = [
  {
    _id: "mock-art-1",
    title: 'Understanding PCOS Symptoms',
    slug: 'understanding-pcos-symptoms',
    category: 'PCOS',
    summary:
      'Learn common PCOS signs such as irregular periods, acne, hair changes, and hormone-related symptoms.',
    content:
      'Polycystic Ovary Syndrome (PCOS) is a common endocrine disorder affecting reproductive-age individuals. It is characterized by a combination of hormonal imbalances, ovulatory dysfunction, and metabolic features. Common clinical signs include irregular menstrual cycles, hirsutism (excess facial and body hair), persistent acne, hair thinning, and weight changes. These symptoms are driven by elevated androgen levels and insulin resistance. Understanding PCOS is the first step toward effective management.\n\nMany women remain undiagnosed for years due to the broad range of symptoms. Ovulatory dysfunction often manifests as oligomenorrhea (infrequent cycles) or amenorrhea (absence of cycles). Elevated androgens, like testosterone, cause physical signs like acne along the jawline and male-pattern hair growth. Metabolic effects include insulin resistance, which leads to weight gain and difficulty losing weight. Diagnosing PCOS requires meeting at least two of the three Rotterdam criteria: irregular periods, elevated androgens (either clinical or biochemical), and polycystic ovaries on an ultrasound.\n\nIf you suspect you have PCOS, keep a detailed log of your symptoms. Note cycle length, flow intensity, and physical changes. Prepare a list of questions for your endocrinologist or gynecologist. Lifestyle adjustments, dietary changes, and sometimes medications like metformin or oral contraceptives can help balance hormone levels and manage symptoms.',
    coverImage: '/images/knowledge/pcos-symptoms.jpg',
    tags: ['pcos', 'hormones', 'symptoms'],
    keywords: ['irregular periods', 'acne', 'androgens', 'hormonal imbalance'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: true
  },
  {
    _id: "mock-art-2",
    title: 'PCOS Nutrition Basics',
    slug: 'pcos-nutrition-basics',
    category: 'PCOS',
    summary:
      'A practical guide to balanced meals, fiber, protein, and insulin-friendly habits for PCOS care.',
    content:
      'Nutrition plays a foundational role in managing PCOS, primarily by addressing insulin resistance and chronic low-grade inflammation. Rather than focusing on restrictive diets, a sustainable approach emphasizes balanced meals. A balanced plate should combine high-fiber carbohydrates, lean proteins, healthy fats, and a variety of colorful vegetables to help stabilize blood sugar levels and manage insulin response.\n\nInsulin resistance affects a significant portion of individuals with PCOS, leading the pancreas to produce excess insulin. High insulin can stimulate the ovaries to produce more androgens, worsening symptoms like acne and hair growth. To manage this, choose complex, high-fiber carbohydrates like quinoa, brown rice, and oats, which release glucose slowly into the bloodstream. Pair these with high-quality proteins such as chicken, tofu, lentils, or fish to slow digestion and prevent blood sugar spikes.\n\nHealthy fats, particularly omega-3 fatty acids found in salmon, walnuts, and chia seeds, support cell membrane health and reduce inflammation. Aim to fill half your plate with non-starchy vegetables like spinach, broccoli, and peppers. Regular, consistent meals can also prevent glucose dips that trigger sugar cravings. Work with a registered dietitian to tailor a meal plan that fits your lifestyle.',
    coverImage: '/images/knowledge/pcos-nutrition.jpg',
    tags: ['pcos', 'nutrition', 'insulin resistance'],
    keywords: ['balanced meals', 'fiber', 'protein', 'metabolic health'],
    readingTime: 6,
    author: 'SheCare Nutrition Team',
    featured: true
  },
  {
    _id: "mock-art-3",
    title: 'How to Track Your Menstrual Cycle',
    slug: 'how-to-track-your-menstrual-cycle',
    category: 'Menstrual Health',
    summary:
      'Track dates, symptoms, flow, mood, and pain levels to understand your cycle patterns over time.',
    content:
      'Menstrual cycle tracking is a simple yet powerful tool for understanding your reproductive health. By recording key cycle data consistently, you can uncover patterns that help predict your period, identify your fertile window, and detect hormonal imbalances. Tracking flow intensity, symptoms, mood, sleep, and cervical mucus provides a comprehensive picture of your overall wellness.\n\nA standard menstrual cycle ranges from 21 to 35 days, measured from the first day of one period to the first day of the next. To start, log the exact date your period begins and ends. Note flow intensity (light, medium, or heavy) and any symptoms like cramping, bloating, headaches, or fatigue. Mood fluctuations, energy levels, and changes in sleep quality are also valuable metrics, as they reflect shifting hormone levels.\n\nIf you are tracking for fertility or health monitoring, pay attention to changes in cervical mucus. As ovulation approaches, estrogen increases, causing cervical mucus to become clear, slippery, and stretchy, resembling egg whites. Basal body temperature (BBT) tracking is another method, where a slight rise in temperature indicates that ovulation has occurred. Maintaining a consistent log helps you provide clear information to your healthcare provider.',
    coverImage: '/images/knowledge/cycle-tracking.jpg',
    tags: ['cycle tracking', 'periods', 'symptoms'],
    keywords: ['menstrual cycle', 'period tracking', 'flow', 'cramps'],
    readingTime: 4,
    author: 'SheCare Wellness Team',
    featured: false
  },
  {
    _id: "mock-art-4",
    title: 'Irregular Periods: When to Seek Care',
    slug: 'irregular-periods-when-to-seek-care',
    category: 'Menstrual Health',
    summary:
      'Understand common causes of irregular periods and signs that deserve a healthcare conversation.',
    content:
      'Menstrual cycle regularity is a key indicator of endocrine health. While occasional cycle variations are common due to temporary factors like stress or travel, persistent irregularity warrants clinical evaluation. Understanding the common causes of irregular periods and knowing when to consult a healthcare provider can prevent complications and support early intervention.\n\nAn irregular cycle is defined as a cycle that consistently falls outside the 21-to-35-day range, varies significantly in length from month to month, or stops entirely. Common causes include hormonal imbalances (such as PCOS or thyroid disorders), elevated cortisol from chronic stress, sudden weight fluctuations, intense exercise, and conditions like hyperprolactinemia. Oral contraceptives and certain medications can also affect regularity.\n\nSeek medical evaluation if your period stops for more than three consecutive months (amenorrhea), if your cycle length changes suddenly and remains unpredictable, or if you experience extremely heavy bleeding (requiring changing a pad or tampon every hour). Severe pelvic pain, fever during your period, or bleeding between cycles are also signs that deserve immediate attention. A doctor can run blood tests and pelvic ultrasounds to identify the underlying cause.',
    coverImage: '/images/knowledge/irregular-periods.jpg',
    tags: ['irregular periods', 'cycle health', 'pcos'],
    keywords: ['amenorrhea', 'heavy bleeding', 'thyroid', 'stress'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: true
  },
  {
    _id: "mock-art-5",
    title: 'Hormonal Acne and Cycle Changes',
    slug: 'hormonal-acne-and-cycle-changes',
    category: 'Skin & Hormones',
    summary:
      'Explore why acne may flare around cycle changes and how hormone patterns can affect skin.',
    content:
      'Hormonal acne is a common and often frustrating symptom that correlates with menstrual cycle phases. Fluctuations in hormones, particularly progesterone and androgens, influence sebum production and skin inflammation. Understanding the relationship between your cycle and skin health can help you adapt your skincare routine and seek appropriate treatments.\n\nDuring the first half of the cycle, estrogen is the dominant hormone, supporting skin hydration and collagen production. However, after ovulation, progesterone rises, stimulating the sebaceous glands to produce more sebum. Near the end of the cycle, both estrogen and progesterone drop, while relative levels of testosterone remain constant. This relative rise in androgens, combined with accumulated sebum, creates an environment where acne-causing bacteria can thrive.\n\nHormonal acne typically appears along the jawline, chin, and lower cheeks as deep, tender, cystic blemishes. A gentle, non-comedogenic skincare routine is essential. Avoid harsh scrubs that damage the skin barrier. Look for ingredients like salicylic acid to clear pores and benzoyl peroxide to target bacteria. In persistent cases, consult a dermatologist to discuss prescription options like topical retinoids, spironolactone, or hormonal therapy.',
    coverImage: '/images/knowledge/hormonal-acne.jpg',
    tags: ['acne', 'hormones', 'skin'],
    keywords: ['androgens', 'jawline acne', 'cycle flare', 'inflammation'],
    readingTime: 4,
    author: 'SheCare Dermatology Education',
    featured: false
  },
  {
    _id: "mock-art-6",
    title: 'Stress, Sleep, and Hormone Balance',
    slug: 'stress-sleep-and-hormone-balance',
    category: 'Lifestyle',
    summary:
      'See how stress and sleep can influence cycle symptoms, cravings, energy, and hormone rhythms.',
    content:
      'The endocrine system is highly sensitive to environmental factors, with stress and sleep quality being primary regulators of hormone balance. Chronic stress and sleep deprivation disrupt the body\'s natural rhythms, affecting cortisol levels, appetite signaling, insulin sensitivity, and menstrual cycle regularity. Establishing restorative habits is essential for maintaining hormonal equilibrium.\n\nWhen you experience stress, the adrenal glands release cortisol and adrenaline. While useful in short-term scenarios, chronically high cortisol levels disrupt the hypothalamic-pituitary-ovary (HPO) axis, which regulates reproductive hormones. This disruption can delay or suppress ovulation, leading to irregular or missed periods. Additionally, cortisol increases glucose production, worsening insulin resistance and carbohydrate cravings.\n\nSleep deprivation acts as a physical stressor, further elevating cortisol and disrupting melatonin secretion. Melatonin is a powerful antioxidant that supports cell health and ovarian function. Poor sleep also alters leptin and ghrelin, the hormones that signal fullness and hunger, leading to increased cravings. Aim for 7 to 8 hours of quality sleep per night in a dark room. Practice relaxation techniques, such as meditation or progressive muscle relaxation, to manage daily stressors.',
    coverImage: '/images/knowledge/stress-sleep.jpg',
    tags: ['stress', 'sleep', 'hormones'],
    keywords: ['cortisol', 'insulin sensitivity', 'rest', 'lifestyle'],
    readingTime: 5,
    author: 'SheCare Wellness Team',
    featured: false
  },
  {
    _id: "mock-art-7",
    title: 'PCOS and Exercise: Best Practices',
    slug: 'pcos-and-exercise-best-practices',
    category: 'PCOS',
    summary:
      'Understand the role of physical activity in managing insulin resistance and general well-being.',
    content:
      'Physical activity is a cornerstone of PCOS management, offering metabolic, cardiovascular, and mental health benefits. Rather than focusing on intense, exhausting workouts, a balanced approach combining resistance training, moderate cardio, and active recovery yields the best results for hormone regulation and insulin sensitivity.\n\nInsulin resistance is a central feature of PCOS, and muscle tissue is a primary site for glucose uptake. Resistance training, such as weightlifting or bodyweight exercises, builds muscle mass and increases the density of glucose transporters, allowing muscles to clear sugar from the blood more efficiently. Aim for two to three strength sessions per week, focusing on compound movements like squats and rows.\n\nCardiovascular exercise supports heart health and reduces visceral fat. Moderate-intensity steady-state (MISS) cardio, like walking, cycling, or swimming, is often preferable to high-intensity interval training (HIIT) for individuals with high stress levels, as HIIT can spike cortisol if not paired with adequate rest. Active recovery, including yoga, stretching, and walking, supports lymphatic drainage and stress reduction. Listen to your body and prioritize consistency over intensity.',
    coverImage: '/images/knowledge/pcos-exercise.jpg',
    tags: ['pcos', 'exercise', 'insulin resistance'],
    keywords: ['strength training', 'hiit', 'cortisol', 'workouts'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: false
  },
  {
    _id: "mock-art-8",
    title: 'Managing Mood Swings Naturally',
    slug: 'managing-mood-swings-naturally',
    category: 'Mental Health',
    summary:
      'Tips and coping mechanisms to handle premenstrual and cycle-related mood changes.',
    content:
      'Cycle-related mood swings, particularly those associated with Premenstrual Dysphoric Disorder (PMDD) or Premenstrual Syndrome (PMS), are driven by the brain\'s sensitivity to hormonal fluctuations. Estrogen and progesterone influence neurotransmitters like serotonin and GABA, affecting mood, anxiety, and stress response. Natural strategies can help stabilize these emotional shifts.\n\nEstrogen supports the synthesis and binding of serotonin, the neurotransmitter associated with feelings of happiness and well-being. As estrogen drops during the luteal phase (the second half of the cycle), serotonin levels can also decline, leading to irritability, sadness, and cravings. Progesterone, while calming, metabolizes into compounds that affect GABA receptors. For sensitive individuals, sudden changes in progesterone can trigger anxiety or mood swings.\n\nTo manage mood swings naturally, track your cycle to identify when emotional shifts typically occur. Support neurotransmitter production by eating foods rich in tryptophan, magnesium, and B vitamins (such as leafy greens, bananas, and seeds). Regular, moderate exercise raises endorphins, which lift mood. Gentle practices like journaling, guided breathing, and setting boundaries during your premenstrual week can provide emotional space. Speak with a counselor if symptoms significantly impact your daily life.',
    coverImage: '/images/knowledge/mood-swings.jpg',
    tags: ['mood', 'mental health', 'pms'],
    keywords: ['serotonin', 'progesterone', 'crying spells', 'anxiety'],
    readingTime: 6,
    author: 'SheCare Mental Wellness Team',
    featured: true
  },
  {
    _id: "mock-art-9",
    title: 'Guide to Endocrine Disruptors',
    slug: 'guide-to-endocrine-disruptors',
    category: 'Lifestyle',
    summary:
      'Learn about everyday chemicals that might interfere with your hormonal system.',
    content:
      'Endocrine disrupting chemicals (EDCs) are substances found in everyday products that interfere with the body\'s endocrine system. They can mimic, block, or alter hormone synthesis and transport, contributing to reproductive disorders, metabolic issues, and hormonal imbalances. Learning to identify and reduce exposure to these chemicals supports long-term wellness.\n\nEDCs are found in a wide variety of household and personal care items. Common examples include phthalates (used to soften plastics and extend fragrance life), bisphenols like BPA (found in plastic containers and thermal cash receipts), parabens (used as preservatives in cosmetics), and perfluorinated chemicals (found in non-stick cookware and water-resistant fabrics).\n\nTo reduce your exposure, transition to glass, stainless steel, or ceramic containers for food storage, especially when heating. Avoid microwaving plastic containers. Choose personal care products labeled "phthalate-free," "paraben-free," and "fragrance-free," as "fragrance" is a catch-all term that often hides phthalates. Filter your drinking water and replace damaged non-stick pans with cast iron or stainless steel options. Small, consistent changes in your environment accumulate over time to reduce your body\'s toxic burden.',
    coverImage: '/images/knowledge/endocrine-disruptors.jpg',
    tags: ['endocrine', 'toxins', 'lifestyle'],
    keywords: ['plastics', 'parabens', 'hormone mimic', 'fragrance free'],
    readingTime: 5,
    author: 'SheCare Environmental Health',
    featured: false
  },
  {
    _id: "mock-art-10",
    title: 'The Role of Insulin in PCOS',
    slug: 'the-role-of-insulin-in-pcos',
    category: 'PCOS',
    summary:
      'Explore how insulin affects ovarian function and androgen production in PCOS.',
    content:
      'Insulin resistance is a primary driver of the hormonal and metabolic abnormalities seen in PCOS. Understanding how insulin interacts with the ovaries and other tissues helps clarify why symptoms like weight gain, acne, and irregular periods develop and guides effective management strategies.\n\nInsulin is a hormone produced by the pancreas that allows cells to absorb glucose from the blood for energy. In individuals with insulin resistance, cells become less responsive to insulin, prompting the pancreas to produce higher levels of the hormone. This excess insulin has direct, adverse effects on the ovaries, stimulating the production of testosterone and other androgens, which can impair follicle development and suppress ovulation.\n\nHigh insulin also suppresses sex hormone-binding globulin (SHBG) production in the liver, leaving more free, active testosterone circulating in the bloodstream. This leads to physical symptoms like hirsutism and male-pattern hair loss. Managing insulin resistance involves dietary adjustments (prioritizing high-fiber, low-glycemic foods), regular physical activity, stress management, and sometimes medications like metformin or natural supplements like myo-inositol.',
    coverImage: '/images/knowledge/insulin-pcos.jpg',
    tags: ['pcos', 'insulin', 'androgens'],
    keywords: ['insulin resistance', 'ovaries', 'hirsutism', 'blood sugar'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: false
  },
  {
    _id: "mock-art-11",
    title: 'Hydration Goals for Hormone Health',
    slug: 'hydration-goals-for-hormone-health',
    category: 'Nutrition',
    summary:
      'Understand how optimal water intake impacts cortisol levels and waste clearance.',
    content:
      'Hydration is a fundamental yet frequently overlooked component of hormone health and metabolic regulation. Adequate water intake supports cellular function, kidney and liver detoxification, joint lubrication, digestion, and stress response. Staying properly hydrated helps optimize the body\'s physiological processes.\n\nHormones are transported through the bloodstream, and adequate hydration maintains blood volume and circulation, ensuring hormones reach target tissues efficiently. Additionally, the liver and kidneys require water to process and excrete excess hormones and metabolic waste. Chronic dehydration can impair this clearance process, contributing to estrogen dominance or toxin accumulation.\n\nDehydration acts as a physical stressor, stimulating the adrenal glands to produce cortisol. Elevated cortisol can disrupt the balance of reproductive hormones and increase glucose production, contributing to insulin resistance. Aim to drink half your body weight in ounces of water daily, adjusting for activity levels and climate. Monitor hydration by checking your urine color, which should be pale yellow. Carry a reusable bottle to encourage regular intake.',
    coverImage: '/images/knowledge/hydration-hormones.jpg',
    tags: ['hydration', 'water', 'nutrition'],
    keywords: ['detoxification', 'cortisol', 'digestion', 'cellular energy'],
    readingTime: 4,
    author: 'SheCare Nutrition Team',
    featured: false
  },
  {
    _id: "mock-art-12",
    title: 'Fertility Awareness Method Explained',
    slug: 'fertility-awareness-method-explained',
    category: 'Menstrual Health',
    summary:
      'Learn the principles of natural fertility tracking through temperature and signs.',
    content:
      'The Fertility Awareness Method (FAM) is a natural approach to tracking reproductive cycles to identify the fertile window. By observing and recording physiological signs of fertility, individuals can understand their ovulation patterns for pregnancy planning or natural birth control. Consistent education and tracking are essential for accuracy.\n\nFAM relies on tracking three primary biomarkers: waking temperature (Basal Body Temperature), cervical mucus, and cycle days. Basal body temperature is measured immediately upon waking, before any physical activity. A slight, sustained rise in BBT indicates that ovulation has occurred, driven by progesterone. Cervical mucus changes under the influence of estrogen, becoming clear, slippery, and stretchy as ovulation approaches.\n\nTo use FAM effectively, record your observations daily on a chart or tracking app. The fertile window typically spans the five days preceding ovulation and the day of ovulation itself, as sperm can survive in fertile cervical mucus for up to five days. FAM requires daily commitment, consistent sleep patterns for BBT tracking, and an understanding of how illness or stress can affect biomarkers. Consult a qualified educator to learn the rules of the method.',
    coverImage: '/images/knowledge/fertility-awareness.jpg',
    tags: ['fertility', 'ovulation', 'natural family planning'],
    keywords: ['cervical mucus', 'basal body temperature', 'fertile window'],
    readingTime: 6,
    author: 'SheCare Clinical Education',
    featured: false
  },
  {
    _id: "mock-art-13",
    title: 'Vitamins and Supplements for PCOS',
    slug: 'vitamins-and-supplements-for-pcos',
    category: 'PCOS',
    summary:
      'A review of scientifically backed vitamins that help support PCOS symptoms.',
    content:
      'While a balanced diet is the foundation of PCOS care, targeted vitamins and supplements can provide additional support for insulin sensitivity, ovarian function, and inflammation. Understanding the scientific backing for common supplements helps you make informed choices in consultation with your healthcare provider.\n\nMyo-inositol and D-chiro-inositol are among the most studied supplements for PCOS. Inositol acts as a secondary messenger in insulin signaling, supporting glucose uptake and ovarian function. A 40:1 ratio of myo-inositol to D-chiro-inositol has been shown to improve ovulation rates and insulin sensitivity. Vitamin D is another essential nutrient, as deficiency is common in individuals with PCOS and correlates with insulin resistance and ovulatory dysfunction.\n\nOmega-3 fatty acids, rich in EPA and DHA, help reduce chronic low-grade inflammation, support lipid profiles, and reduce androgen levels. Zinc supports skin health, reduces hormonal acne, and helps manage hirsutism. N-acetylcysteine (NAC) is an antioxidant that improves insulin sensitivity and supports liver detoxification. Always discuss supplement choices and dosages with your doctor to ensure they align with your health needs.',
    coverImage: '/images/knowledge/pcos-vitamins.jpg',
    tags: ['pcos', 'supplements', 'vitamins'],
    keywords: ['inositol', 'vitamin d', 'omega-3', 'ovarian function'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: false
  },
  {
    _id: "mock-art-14",
    title: 'Understanding Your Luteal Phase',
    slug: 'understanding-your-luteal-phase',
    category: 'Menstrual Health',
    summary:
      'What happens in your body during the second half of the cycle, and how to adapt.',
    content:
      'The luteal phase is the second half of the menstrual cycle, occurring after ovulation and lasting until the start of your next period. Dominated by the hormone progesterone, this phase plays a critical role in reproductive health and influences physical energy, mood, and nutrient requirements.\n\nFollowing ovulation, the ruptured follicle transforms into the corpus luteum, which secretes progesterone. Progesterone prepares the uterine lining for potential implantation and has a calming effect on the nervous system, supporting sleep and stress tolerance. If fertilization does not occur, the corpus luteum degrades, progesterone and estrogen drop, and the uterine lining sheds, marking the start of menstruation.\n\nA normal luteal phase lasts between 11 and 17 days. A short luteal phase (less than 10 days) can indicate low progesterone, which may affect fertility. During this phase, your basal metabolic rate increases slightly, meaning your body requires more energy. You may experience increased appetite, cravings, and lower physical energy. Shift your workout routine to lower-intensity options like Pilates or moderate walking, and prioritize nutrient-dense, warming foods.',
    coverImage: '/images/knowledge/luteal-phase.jpg',
    tags: ['luteal phase', 'progesterone', 'cycle phases'],
    keywords: ['progesterone', 'cravings', 'low energy', 'restorative care'],
    readingTime: 5,
    author: 'SheCare Wellness Team',
    featured: false
  },
  {
    _id: "mock-art-15",
    title: 'Gut Health and Hormone Balance',
    slug: 'gut-health-and-hormone-balance',
    category: 'Lifestyle',
    summary:
      'Explore the estrobolome and how your gut microbiome metabolizes estrogen.',
    content:
      'The gastrointestinal tract is deeply connected to endocrine function, with the gut microbiome acting as a key regulator of hormone balance. The microbiome plays a central role in digesting nutrients, managing inflammation, regulating insulin, and metabolizing hormones like estrogen. Supporting gut health is essential for overall hormonal wellness.\n\nThe relationship between the gut and estrogen is mediated by the estrobolome, a collection of gut bacteria capable of metabolizing and modulating the body\'s circulating estrogen. These bacteria produce an enzyme called beta-glucuronidase, which reactivates conjugated estrogen, allowing it to re-enter circulation. If the microbiome is unbalanced (dysbiosis), beta-glucuronidase activity can alter, contributing to estrogen deficiency or estrogen dominance.\n\nFurthermore, gut health directly influences insulin sensitivity. A diverse microbiome produces short-chain fatty acids (SCFAs), which support gut barrier integrity and reduce systemic inflammation. To support your gut, eat a variety of fiber-rich plant foods, which feed beneficial bacteria. Include fermented foods like yogurt, kefir, and kimchi. Manage stress and limit processed foods, which can disrupt the delicate balance of your microbiome.',
    coverImage: '/images/knowledge/gut-health.jpg',
    tags: ['gut health', 'microbiome', 'estrogen'],
    keywords: ['estrobolome', 'fiber', 'fermented foods', 'metabolism'],
    readingTime: 5,
    author: 'SheCare Nutrition Team',
    featured: false
  },
  {
    _id: "mock-art-16",
    title: 'How to Deal with Period Cramps',
    slug: 'how-to-deal-with-period-cramps',
    category: 'Menstrual Health',
    summary:
      'Effective remedies for managing menstrual pain and soothing abdominal cramps.',
    content:
      'Period cramps, or dysmenorrhea, are a common source of discomfort during menstrual cycles. Caused by the release of prostaglandins that prompt uterine contractions, cramps can range from mild to severe. Implementing targeted remedies and lifestyle habits can help soothe pelvic pain and support comfort.\n\nPrimary dysmenorrhea is caused by natural chemical compounds called prostaglandins, which stimulate the uterine muscles to contract and shed its lining. High levels of prostaglandins contribute to stronger, more painful contractions. Secondary dysmenorrhea, on the other hand, is associated with underlying reproductive conditions such as endometriosis, fibroids, or adenomyosis.\n\nTo manage cramps, apply heat to the lower abdomen using a heating pad or warm bath to increase blood flow and relax muscles. Stay active with gentle movement like walking or pelvic stretches, which release endorphins. Focus on anti-inflammatory foods rich in omega-3s, and consider supplements like magnesium, which helps relax smooth muscle tissue. Over-the-counter anti-inflammatory medications (NSAIDs) can also block prostaglandin production. Consult your gynecologist if cramps are severe and disrupt daily activities.',
    coverImage: '/images/knowledge/period-cramps.jpg',
    tags: ['cramps', 'pain management', 'period relief'],
    keywords: ['prostaglandins', 'heat therapy', 'dysmenorrhea', 'magnesium'],
    readingTime: 4,
    author: 'SheCare Wellness Team',
    featured: true
  },
  {
    _id: "mock-art-17",
    title: 'Skincare Routine for Hormonal Skin',
    slug: 'skincare-routine-for-hormonal-skin',
    category: 'Skin & Hormones',
    summary:
      'Build a simple, gentle skincare routine that won\'t aggravate hormonal breakouts.',
    content:
      'Hormonal skin fluctuations, particularly those leading to premenstrual breakouts, require a gentle, supportive approach. Rather than using harsh, stripping products that can damage the skin barrier, a routine focused on maintaining balance, reducing inflammation, and supporting skin barrier integrity is key.\n\nHormonal acne develops when sebaceous glands produce excess sebum under the influence of fluctuating hormones, combined with poor skin cell shedding that clogs pores. To care for hormonal skin, start with a gentle, hydrating cleanser that removes impurities without stripping moisture. Avoid scrubbing, which can worsen inflammation.\n\nIncorporate targeted treatments containing salicylic acid (BHA) to penetrate pores and exfoliate build-up, or niacinamide to calm redness and regulate sebum. Hydration is essential, as dehydrated skin can overproduce oil to compensate; choose oil-free, non-comedogenic moisturizers containing hyaluronic acid or ceramides to support barrier function. Always apply daily SPF to prevent post-inflammatory hyperpigmentation. Consult a dermatologist for personalized, clinical skincare guidance.',
    coverImage: '/images/knowledge/skincare-hormones.jpg',
    tags: ['skincare', 'acne', 'barriers'],
    keywords: ['rosewater', 'non-comedogenic', 'skin barrier', 'blemish'],
    readingTime: 4,
    author: 'SheCare Dermatology Education',
    featured: false
  },
  {
    _id: "mock-art-18",
    title: 'PCOS and Thyroid: The Connection',
    slug: 'pcos-and-thyroid-the-connection',
    category: 'PCOS',
    summary:
      'Learn why thyroid health and PCOS overlap and how to evaluate shared symptoms.',
    content:
      'Polycystic Ovary Syndrome (PCOS) and thyroid disorders are two of the most common endocrine conditions in women. They share overlapping symptoms and can influence one another\'s clinical presentation. Understanding the link between PCOS and thyroid health is essential for accurate diagnosis and comprehensive care.\n\nStudies indicate that women with PCOS have a higher prevalence of autoimmune thyroid disorders, particularly Hashimoto\'s thyroiditis. Both conditions share clinical features such as fatigue, weight changes, irregular menstrual cycles, and hair thinning, which can make diagnosis challenging without detailed blood evaluations.\n\nHypothyroidism (underactive thyroid) can worsen insulin resistance, a central feature of PCOS, and contribute to ovarian cysts. Conversely, high insulin and estrogen dominance can impact thyroid hormone synthesis and transport. A comprehensive endocrine workup should measure thyroid-stimulating hormone (TSH), free T3, free T4, and thyroid antibodies, alongside reproductive hormones. Managing both conditions through tailored medical, nutritional, and lifestyle support optimizes metabolic and hormonal outcomes.',
    coverImage: '/images/knowledge/thyroid-pcos.jpg',
    tags: ['pcos', 'thyroid', 'hashimoto'],
    keywords: ['hashimotos', 'fatigue', 'metabolism', 'endocrine'],
    readingTime: 5,
    author: 'SheCare Clinical Education',
    featured: false
  },
  {
    _id: "mock-art-19",
    title: 'Mindfulness for Cycle Stress',
    slug: 'mindfulness-for-cycle-stress',
    category: 'Mental Health',
    summary:
      'Reduce anxiety and manage PMS symptoms through targeted mindfulness practices.',
    content:
      'Mindfulness practices offer a powerful, evidence-based approach to managing stress and emotional fluctuations throughout the menstrual cycle. By calming the autonomic nervous system, mindfulness helps lower cortisol levels, supports emotional regulation, and reduces cycle-related anxiety and PMS symptoms.\n\nThe body\'s stress response is controlled by the sympathetic nervous system. Chronic activation of this response elevates cortisol, which can disrupt reproductive hormones and exacerbate symptoms like cramps, mood swings, and sleep issues. Mindfulness practices activate the parasympathetic nervous system (the "rest and digest" state), lowering heart rate and cortisol levels.\n\nSimple daily practices can make a significant difference. Try guided breathing exercises, spending just 5 to 10 minutes focusing on slow, deep breaths to calm the mind. Body scans help connect you to physical sensations without judgment, easing muscle tension. Daily journaling allows you to express thoughts and track cycle patterns, fostering self-compassion. Dedicating consistent time to mindfulness supports long-term emotional resilience.',
    coverImage: '/images/knowledge/mindfulness-stress.jpg',
    tags: ['mindfulness', 'stress', 'anxiety'],
    keywords: ['guided breathing', 'body scans', 'nervous system', 'pms'],
    readingTime: 4,
    author: 'SheCare Mental Wellness Team',
    featured: false
  },
  {
    _id: "mock-art-20",
    title: 'Sleep Quality and Fertility',
    slug: 'sleep-quality-and-fertility',
    category: 'Lifestyle',
    summary:
      'Understand how deep sleep protects egg quality and stabilizes hormonal cycles.',
    content:
      'Sleep quality is a critical regulator of reproductive health and fertility. The circadian rhythm coordinates the release of essential hormones, and deep, restorative sleep supports egg quality, stabilizes menstrual cycles, and optimizes metabolic health.\n\nThe hypothalamus regulates both sleep-wake cycles and reproductive hormone secretion. Disrupted sleep patterns or chronic sleep deprivation can alter the release of luteinizing hormone (LH) and follicle-stimulating hormone (FSH), potentially affecting ovulation and cycle regularity. Additionally, the hormone melatonin, produced during sleep in a dark environment, is a potent antioxidant that helps protect developing oocytes (egg cells) from oxidative stress.\n\nTo support sleep quality, maintain a consistent sleep schedule by going to bed and waking up at the same time daily. Keep your bedroom cool, quiet, and completely dark to support melatonin production. Avoid screens and blue light for at least an hour before bed, opting for relaxing wind-down activities. Regular exposure to natural daylight in the morning helps anchor your circadian rhythm, supporting both restful sleep and balanced hormones.',
    coverImage: '/images/knowledge/sleep-fertility.jpg',
    tags: ['sleep', 'fertility', 'melatonin'],
    keywords: ['melatonin', 'egg quality', 'rest', 'circadian rhythm'],
    readingTime: 5,
    author: 'SheCare Wellness Team',
    featured: false
  }
];
