# SheCare ML Model Documentation

This document describes SheCare's ML services, datasets, preprocessing, features, training approach, metrics, limitations, and safety notes.

## ML Services Overview

| Service | Location | Purpose | Model/approach | Runtime |
| --- | --- | --- | --- | --- |
| PCOS risk prediction | `ml-model/pcos-service` | Estimate PCOS risk from clinical and symptom inputs | Random Forest classifier with fallback rule-based predictor | FastAPI on `8000` |
| Cycle irregularity prediction | `ml-model/cycle-service` | Estimate whether cycle context suggests irregularity | Random Forest classifier plus challenge-set evaluation | FastAPI on `8001` |
| Article recommendation | `ml-model/article-service` | Recommend related Knowledge Hub articles | TF-IDF vectorizer plus cosine similarity | FastAPI on `8002` |

## PCOS Risk Prediction

### Dataset

| Item | Value |
| --- | --- |
| Source file | `ml-model/pcos-service/data/PCOS_data.csv` |
| Rows | `541` |
| Target | `PCOS (Y/N)`, cleaned to `pcos_y_n` |
| Model artifact | `model/pcos_random_forest.pkl` |
| Feature columns | `model/feature_columns.json` |
| Metrics | `model/model_metrics.json` |
| Feature importance | `model/feature_importance.json` |

The PCOS dataset contains clinical measurements, hormonal indicators, ultrasound follicle counts, anthropometric measurements, and binary symptom/lifestyle indicators.

### Preprocessing

Implemented in:

```text
ml-model/pcos-service/app/utils/preprocessing.py
```

Pipeline:

1. Load CSV from `data/PCOS_data.csv`.
2. Normalize column names to machine-friendly snake case.
3. Clean target column.
4. Split features and target.
5. Handle missing values and inconsistent input types.
6. Save final feature column order to `feature_columns.json`.
7. Train and save model artifacts.

### Features

Major feature groups:

| Group | Example features |
| --- | --- |
| Demographics/body measures | `age_yrs`, `weight_kg`, `height_cm`, `bmi` |
| Cycle indicators | `cycle_r_i`, `cycle_length_days` |
| Symptoms | `weight_gain_y_n`, `hair_growth_y_n`, `skin_darkening_y_n`, `hair_loss_y_n`, `pimples_y_n` |
| Lifestyle | `fast_food_y_n`, `reg_exercise_y_n` |
| Hormonal/lab values | `amh_ng_ml`, `fsh_miu_ml`, `lh_miu_ml`, `fsh_lh`, `tsh_miu_l`, `vit_d3_ng_ml` |
| Body ratios | `waist_inch`, `hip_inch`, `waist_hip_ratio` |
| Ultrasound | `follicle_no_l`, `follicle_no_r`, average follicle size |

Top current feature importances:

| Rank | Feature | Importance |
| ---: | --- | ---: |
| 1 | `follicle_no_r` | 19.42% |
| 2 | `follicle_no_l` | 11.75% |
| 3 | `skin_darkening_y_n` | 5.57% |
| 4 | `weight_gain_y_n` | 5.40% |
| 5 | `hair_growth_y_n` | 4.99% |

### Training Split

Training script:

```text
ml-model/pcos-service/train_model.py
```

Split settings:

| Setting | Value |
| --- | --- |
| Test size | `20%` |
| Random state | `42` |
| Stratification | Target-stratified |
| Class handling | `class_weight="balanced"` |
| Model | `RandomForestClassifier` |
| Estimators | `200` |

### Metrics

Current test metrics:

| Metric | Value |
| --- | ---: |
| Accuracy | 93.58% |
| Precision / PPV | 96.77% |
| Recall / sensitivity | 83.33% |
| F1-score | 89.55% |
| Specificity | 98.63% |
| Balanced accuracy | 90.98% |
| ROC-AUC | 93.63% |
| False negative rate | 16.67% |

Confusion matrix:

| | Predicted no risk | Predicted risk |
| --- | ---: | ---: |
| Actual no risk | 72 | 1 |
| Actual risk | 6 | 30 |

### Interpretation

The model has high precision and specificity, so false positives are low. The main safety concern is recall: 6 of 36 positive cases in the test split were missed. For healthcare screening support, recall and false-negative rate should be monitored more closely than accuracy alone.

## Cycle Irregularity Prediction

### Dataset

| Item | Value |
| --- | --- |
| Main source file | `ml-model/cycle-service/data/cycle_data.csv` |
| Main rows | `895` |
| Challenge source file | `ml-model/cycle-service/data/cycle_challenge_cases.csv` |
| Challenge rows | `20` |
| Target | Existing target if present; otherwise derived from cycle length |
| Model artifact | `model/cycle_irregularity_model.pkl` |
| Metrics | `model/model_metrics.json` |

The main cycle dataset contains age, BMI, stress level, exercise frequency, sleep hours, diet, cycle dates, cycle length, period length, and symptoms.

### Preprocessing

Implemented in:

```text
ml-model/cycle-service/app/utils/preprocessing.py
```

Pipeline:

1. Load cycle CSV.
2. Normalize column names.
3. Detect an existing target column if present.
4. If no target exists, create target from cycle length:
   - irregular if `cycle_length < 21`
   - irregular if `cycle_length > 35`
5. Detect relevant feature columns through aliases.
6. Impute numeric fields with median.
7. Impute categorical fields with mode.
8. One-hot encode categorical fields.
9. Save feature columns and preprocessing metadata.

### Features

Selected source features:

| Feature | Meaning |
| --- | --- |
| `age` | User age |
| `cycle_length` | Length of menstrual cycle |
| `period_length` | Number of bleeding days |
| `stress_level` | Self-reported stress |
| `sleep_hours` | Sleep duration |
| `exercise_frequency` | Exercise frequency category |
| `bmi` | Body mass index |
| `diet` | Diet category |
| `symptoms` | Primary symptom category |

Top feature importances:

| Rank | Feature | Importance |
| ---: | --- | ---: |
| 1 | `cycle_length` | 87.08% |
| 2 | `bmi` | 2.28% |
| 3 | `sleep_hours` | 1.88% |
| 4 | `period_length` | 1.83% |
| 5 | `age` | 1.81% |

### Training Split

Training script:

```text
ml-model/cycle-service/train_model.py
```

Split settings:

| Setting | Value |
| --- | --- |
| Main split | 80% train, 20% standard test |
| Random state | `42` |
| Stratification | Used when possible |
| Model | `RandomForestClassifier` |
| Estimators | `200` |
| Class handling | `class_weight="balanced"` |

The final evaluation combines:

- Standard test split: `179` cases
- Labelled challenge set: `20` cases
- Total evaluation set: `199` cases

### Metrics

Current combined evaluation metrics:

| Metric | Value |
| --- | ---: |
| Accuracy | 94.97% |
| Precision / PPV | 95.50% |
| Recall / sensitivity | 95.50% |
| F1-score | 95.50% |
| Specificity | 94.32% |
| Balanced accuracy | 94.91% |
| False positive rate | 5.68% |
| False negative rate | 4.50% |

Combined confusion matrix:

| | Predicted regular | Predicted irregular |
| --- | ---: | ---: |
| Actual regular | 83 | 5 |
| Actual irregular | 5 | 106 |

### Interpretation

The standard split still scores perfectly because the target was originally created from `cycle_length`, and `cycle_length` remains a dominant input. The labelled challenge set makes evaluation more realistic by including cases where the label does not perfectly follow the simple cycle-length rule.

## Article Recommendation

### Dataset

| Item | Value |
| --- | --- |
| Source file | `ml-model/article-service/data/articles.csv` |
| Article count | `6` |
| Model artifacts | `tfidf_vectorizer.pkl`, `article_vectors.pkl`, `articles_metadata.json` |
| Approach | Unsupervised content similarity |

Required columns:

- `article_id`
- `slug`
- `title`
- `category`
- `summary`
- `content`
- `tags`
- `keywords`
- `reading_time`
- `cover_image`

### Preprocessing

Training script:

```text
ml-model/article-service/train_recommender.py
```

Pipeline:

1. Load `articles.csv`.
2. Validate required columns.
3. Fill missing values.
4. Combine title, category, summary, content, tags, and keywords into `combined_text`.
5. Train `TfidfVectorizer`.
6. Compute article vectors.
7. Compute cosine similarity matrix.
8. Save vectorizer, vectors, similarity matrix, and article metadata.

TF-IDF settings:

| Setting | Value |
| --- | --- |
| Stop words | English |
| Max features | `5000` |
| N-grams | `(1, 2)` |

### Metrics

Because the article recommender is unsupervised, it does not have classification accuracy.

Current artifact metrics:

| Metric | Value |
| --- | ---: |
| Article count | 6 |
| TF-IDF feature count | 447 |
| Catalog coverage | 100.00% |
| Mean pairwise similarity excluding self | 8.00% |
| Median pairwise similarity excluding self | 8.00% |
| Mean best-match similarity | 15.15% |
| Minimum best-match similarity | 8.62% |
| Maximum best-match similarity | 25.09% |

Better future recommender metrics:

- Precision@k
- Recall@k
- Mean reciprocal rank
- NDCG@k
- Click-through rate
- Save/bookmark rate
- Dwell time

## Ethical And Safety Notes

SheCare ML features are decision-support tools, not clinical diagnosis.

Safety principles:

- Do not present predictions as medical certainty.
- Show disclaimers for PCOS and cycle irregularity outputs.
- Encourage users to consult qualified healthcare professionals.
- Prioritize recall and false-negative monitoring for health risk screening.
- Avoid using accuracy alone as a success metric.
- Monitor metrics by relevant demographic and clinical subgroups.
- Track model drift if production data diverges from training data.
- Do not train on personally identifiable data without consent and governance.
- Keep model artifacts versioned and reproducible.

## Known Limitations

| Area | Limitation |
| --- | --- |
| PCOS model | Dataset size is modest; false negatives remain clinically important |
| PCOS model | External clinical validation is not present |
| Cycle model | Main target can be derived from a feature also used by the model |
| Cycle model | Challenge set improves honesty but is still small |
| Article recommender | Only 6 articles; no user relevance labels |
| Article recommender | TF-IDF does not understand medical semantics deeply |
| All ML services | Fairness and calibration analysis are not yet implemented |

## Recommended Next Work

- Add independent labelled cycle irregularity data.
- Add PCOS calibration plots and threshold tuning.
- Track PR-AUC for PCOS risk.
- Add fairness evaluation by age band, BMI band, and other clinically relevant groups.
- Add ML model version metadata to saved predictions.
- Add labelled article relevance pairs.
- Store production prediction feedback for future validation.

