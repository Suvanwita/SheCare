# SheCare Impact Metrics

Generated from the current ML artifacts in `ml-model/*-service/model` and the local datasets in `ml-model/*-service/data`.

## Executive Summary

| Service | Dataset rows | Test cases | Accuracy | Precision / PPV | Recall / Sensitivity | F1 | Specificity | Balanced accuracy | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| PCOS risk prediction | 541 | 109 | 93.58% | 96.77% | 83.33% | 89.55% | 98.63% | 90.98% | Strong overall, but 6 of 36 positive PCOS cases were missed in the test set. |
| Cycle irregularity detection | 895 | 199 | 94.97% | 95.50% | 95.50% | 95.50% | 94.32% | 94.91% | Includes 179 standard split cases plus 20 labelled challenge cases to avoid relying only on the cycle-length-derived target. |
| Article recommendation | 6 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Content-based TF-IDF recommender; evaluate with coverage and similarity quality instead of classification accuracy. |

## PCOS Risk Prediction

Positive class: `1` = PCOS risk present.

Confusion matrix:

| | Predicted no risk | Predicted risk |
| --- | ---: | ---: |
| Actual no risk | 72 | 1 |
| Actual risk | 6 | 30 |

Derived metrics:

| Metric | Value |
| --- | ---: |
| Accuracy | 93.58% |
| Precision / positive predictive value | 96.77% |
| Recall / sensitivity / true positive rate | 83.33% |
| Specificity / true negative rate | 98.63% |
| F1-score | 89.55% |
| Negative predictive value | 92.31% |
| False positive rate | 1.37% |
| False negative rate | 16.67% |
| Balanced accuracy | 90.98% |
| Matthews correlation coefficient | 85.45% |
| ROC-AUC | 93.63% |
| Positive prevalence in test split | 33.03% |
| Predicted positive rate | 28.44% |

Top feature importances:

| Rank | Feature | Importance |
| ---: | --- | ---: |
| 1 | `follicle_no_r` | 19.42% |
| 2 | `follicle_no_l` | 11.75% |
| 3 | `skin_darkening_y_n` | 5.57% |
| 4 | `weight_gain_y_n` | 5.40% |
| 5 | `hair_growth_y_n` | 4.99% |

Impact interpretation: the model is very conservative about false positives, with only 1 false alarm in 73 actual negatives. The main clinical risk is false negatives: it missed 6 of 36 positive cases, so recall should be improved before treating the prediction as a high-confidence screening signal.

## Cycle Irregularity Detection

Positive class: `1` = irregular cycle.

Confusion matrix:

| | Predicted regular | Predicted irregular |
| --- | ---: | ---: |
| Actual regular | 83 | 5 |
| Actual irregular | 5 | 106 |

Derived metrics:

| Metric | Value |
| --- | ---: |
| Accuracy | 94.97% |
| Precision / positive predictive value | 95.50% |
| Recall / sensitivity / true positive rate | 95.50% |
| Specificity / true negative rate | 94.32% |
| F1-score | 95.50% |
| Negative predictive value | 94.32% |
| False positive rate | 5.68% |
| False negative rate | 4.50% |
| Balanced accuracy | 94.91% |
| Matthews correlation coefficient | 89.81% |
| Positive prevalence in evaluation set | 55.78% |
| Predicted positive rate | 55.78% |

Top feature importances:

| Rank | Feature | Importance |
| ---: | --- | ---: |
| 1 | `cycle_length` | 87.08% |
| 2 | `bmi` | 2.28% |
| 3 | `sleep_hours` | 1.88% |
| 4 | `period_length` | 1.83% |
| 5 | `age` | 1.81% |

Impact interpretation: the standard split still scores 100.00% because preprocessing metadata says the training target was created from `cycle_length`, and `cycle_length` remains the highest-importance input at 87.08%. The reported metrics now include an extra labelled challenge set with realistic edge cases, bringing combined accuracy down to 94.97%. A stronger production validation should still use independently labelled irregularity data.

## Article Recommendation

The article service is an unsupervised content-based recommender, so there is no accuracy, precision, or recall without labelled relevance data.

Current artifact metrics:

| Metric | Value |
| --- | ---: |
| Article count | 6 |
| TF-IDF feature count | 447 |
| Catalog coverage | 100.00% |
| Mean pairwise cosine similarity, excluding self | 8.00% |
| Median pairwise cosine similarity, excluding self | 8.00% |
| Mean best-match similarity | 15.15% |
| Minimum best-match similarity | 8.62% |
| Maximum best-match similarity | 25.09% |

Impact interpretation: all articles are covered by the recommender, but the catalog is very small. Similarity scores are modest, which suggests the articles are fairly diverse or sparse. To measure recommendation quality properly, add labelled user interactions or editorial relevance pairs and then compute precision@k, recall@k, mean reciprocal rank, and click-through rate.

## Recommended Next Metrics

For production impact, add these alongside model accuracy:

| Area | Metric |
| --- | --- |
| Screening quality | Recall, false negative rate, ROC-AUC, PR-AUC, calibration error |
| Safety | High-risk false negatives reviewed, prediction confidence distribution |
| User value | Completed PCOS assessments, cycle logs per active user, reminder completion rate |
| Engagement | Knowledge article CTR, similar-article CTR, repeat usage |
| Operations | Appointment booking conversion, report upload success, notification delivery success |
| Fairness | Metrics by age band, BMI band, cycle regularity, and other clinically relevant groups |
