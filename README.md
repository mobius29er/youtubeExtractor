# 🎯 YouTube Performance Predictor — AI-Powered Creator Analytics

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen)](https://YouTubeextractor-production.up.railway.app/)
[![ML Models](https://img.shields.io/badge/ML%20Models-24%20Trained-blue)](#ml-architecture)
[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20Docker-orange)](#technology-stack)

> **Predict YouTube video performance before you publish.** Get AI-powered insights on CTR, retention scores, and view predictions using advanced machine learning and computer vision.

**🚀 [Try the Live Website](https://YouTubeextractor-production.up.railway.app/)**

---

# YouTube Performance Prediction Using Pre-Publication Features

## Problem Statement
Imagine you are a YouTube creator and you invest substantial time, creativity, and resources into a video. You made sure you have a great hook (introductory statement, question or event that grabs the viewers attention) with a video subject that you know a lot of people want to see, but yet your viewership gets stuck in a few hundred views or worse a few dozen.  You go to "YouTube Studio" (the analytics page for your channel) and you see a few things there: the views, reach (how many times YouTube shows your video to someone), and the click through rate (CTR: how many times someone clicks when they are shown the video).  That is when you see it the CTR is only 1%!  

The YouTube algorithm drives reach from a few different metrics including the CTR, average video duration (AVD), and the engagement (likes, subscribes, comments). So you can have a great video with an AVD and engagement that is outperforming, but if the CTR is too low YouTube will stop showing your video to people.  First impressions really do matter, but
### What drives the CTR?
The thumbnail and the title of the video along with, to a much smaller degree since YouTube now relies on the transcript more, the videos "tags" (key phrases you can add to your video's description). So for a video to perform well we need to have a good CTR rate (>4%), AVD, and engagement.  

I however don't have access to other channels YouTube studio/Analytics so I reverse engineered the YouTube algorithm and formed what I call the Retention Quality Score (RQS).  The engagement portion (like, comments, number of subscribers for the channel not per video), thumbnails, titles, descriptions, and video durations (longer videos have a higher AVD which means a better YouTube algorithm score) I am able to grab from YouTube via its API. So I have all of this, but what am I trying to do with all these metrics and information?  

The goal of this project was to determine whether the success of a YouTube video can be predicted using only its pre-publication features. Specifically, the research asks:
### Research Question
**Can the success of a YouTube video, measured by normalized viewership and a custom-developed Retention Quality Score (RQS), be predicted and replicated by analyzing patterns in its metadata, thumbnail, and text-based content?**

or more simply:

**Why do some creators go viral while others fade?**

### What information to gather?
So to ensure these models are robust 1000 videos across five genres and five different channel sizes are used pulling the top ten, bottom ten, and twenty random videos from each creator.  This provides a diverse spectrum of YouTube interactions and viewership to help provide the models robustness.

### Project Artifacts and References
The primary research and application assets for this project are available at the following locations:

For this project the unsupervised and supervised studies are conducted in this notebook (which is better viewed using an IDE):

**📓 [Open Main Jupyter Notebook](https://github.com/mobius29er/YouTubeExtractor/blob/main/notebooks/YouTubeExtractorAnalysisGenerator.ipynb)**

From this generated data and models they are used to build out the web app in this repo: 

**📂 [Project Repo](https://github.com/mobius29er/YouTubeExtractor)**

which can be viewed here:

**🚀 [Try the Live Website](https://YouTubeextractor-production.up.railway.app/)**

---

## Model Outcomes or Predictions

The project combines **unsupervised** and **supervised learning** to predict YouTube video performance:
### Unsupervised Learning (Clustering and Dimensionality Reduction):
Applied to uncover structure and relationships in the dataset, including:
- **K-Means Clustering** to group videos by performance archetype, thumbnail composition, and engagement ratios.
- **Principal Component Analysis (PCA)** to reduce over 160 features into interpretable components highlighting dominant behavioral patterns.
### Supervised Learning (Regression):
Used to predict continuous performance outcomes such as:
-  **CTR (Click-Through Rate) Model** – Estimates the likelihood of viewer clicking and watching the video.
-  **Retention Quality Score (RQS) Model** – Estimates the engagement and retention of the viewer once they click.
-  **Views Model** – Predicts total view counts, A regression-based forecast of total reach, modeled through a log-transformed, two-stage residual framework.  

### Output
Each model produces a numerical prediction aligned to measurable YouTube metrics:
| Model                  | Description                                     | Learning Type | Inference Inputs                                               | Output               | Training Target                              |
| ---------------------- | ----------------------------------------------- | ------------- | -------------------------------------------------------------- | -------------------- | -------------------------------------------- |
| **K-Means Clustering** | Groups similar content patterns                 | Unsupervised  | 160+ engineered features                                       | Cluster label (1–5)  | —                                            |
| **PCA**                | Identifies dominant variance sources            | Unsupervised  | 160+ engineered features                                       | Principal components | —                                            |
| **CTR Model**          | Predicts likelihood of viewer click-through     | Regression    | Title/desc/tag embeddings, thumbnail CV, duration, subs, genre | CTR predicted (%)         | CTR label or CTR_proxy (see CTR target note) |
| **RQS Model**          | Predicts retention and engagement quality       | Regression    | Pre-publish inputs only                                        | RQS predicted (0–100)     | RQS (post-publish index)                |
| **Views Model**        | Forecasts reach based on RQS, CTR, and metadata | Regression    | CTR_pred, RQS_pred, subs, metadata; log residual + guardrails  | Views predicted           | log(Views)                                   |


### Summary
The unsupervised learning provides insight into how the factors of the data collected interact between genres and channel sizes. This provided the framework and confirmation for the supervised learning portion which is built to provide pre-publication analysis of the thumbnail and title.  These models together create a holistic framework capable of forecasting both engagement (CTR) and viewer retention (RQS), which in turn drive the algorithm to show the video to more people increasing total views.

---

## Data Acquisition

For Data Acquisition, I utilized the YouTube API within its rate limiting to collect the data (about 200-250 videos per day across 4-5 days).  
This was done view the script found here:
**[Extraction Script](https://github.com/mobius29er/youtubeExtractor/blob/main/src/corrected_data_extractor.py)**
This data can be found here:
**[Data Collected](https://github.com/mobius29er/youtubeExtractor/tree/main/extracted_data)**

I originally used the scripts to pull the videos ID and sub counts, but found that this dramatically limited the number of videos I could do so I used this website **[Youtube Channel ID Finder](https://www.streamweasels.com/%20tools/youtube-channel-id-and-%20user-id-convertor/)** to look up the channels ID.  The channels display the YouTube handle in the URL rather than these IDs.  I could have used the handles and saved the time, but the handles are non-static meaning they could be changed or edited by the channel owner so I preferred to utilize the channel ID as the main resource for these API pulls.  The subscribers were easy enough to add while I was in there and as much items as I could easily prepopulate reduces my extraction runtime. If I had unlimited API then I would have just used all script instead of manually filling in this information.

The dataset consisted of approximately **1,000 YouTube videos** drawn from **25 creators across five genres** from **5 tiers** from **New** channels to **Mega** channels:
### Genres
- **Challenge/Stunts**: MrBeast, Zach King, Ryan Trahan, etc.
  - Has some of the highest subscriber and viewership with some of the biggest names
- **Catholic**: Ascension Presents, Bishop Barron, etc.
  - Is a very niche subject, however as we find out has an abnormally high engagement rate compared to more "mainstream" genres
- **Education/Science**: Kurzgesagt, Veritasium, SciShow, etc.
  - Also more niche, but a larger niche than Catholic
- **Gaming**: Jacksepticeye, Call Me Kevin, RTGame, etc.
  - Is one of the biggest if not the biggest genre with a wide variety of channels provides a good mix
- **Kids/Family**: Cocomelon, Diana and Roma, Vlad and Niki, etc.
  - Provides cases where comments are disabled and relies only on the thumbnail, title, likes, and AVD
 
<img width="1514" height="734" alt="image" src="https://github.com/user-attachments/assets/86d52d64-ce12-4102-b0bc-0740b726df8a" />

*Figure 1: RQS performance across genres.*

### Tiers
These different tiers each have their own challenges and goals:
- **Mega**: >50 million subs
  - Maintaining: Usually companies where sometimes hundreds of people rely on these channels to perform where a 1% CTR increase could mean a huge difference in employment
- **Large**: >10 million subs
  - Scaling: Mix of companies and individual creators looking to still grow, but at this point they are more dependent on viewership for sponsorships
- **Mid**: >1 million subs
  - Professional:  This is the threshold for when a channel really is a full time potential
- **Small**: >100,000 subs
  - Sponsorships: This is where creators really start to get offers for sponsorships and exposure.
- **New**: <100,000 subs
  - Building Trust: The hardest threshold to cross is the 1000 where you can start ad revenue then to 10k and finally 100k each have their own challenges to cross, but commonly really need solid engagement for the algorithm to trust them

<img width="1533" height="751" alt="image" src="https://github.com/user-attachments/assets/0f091eab-a7c8-43f4-9d9c-cc8b9b2800dd" />

*Figure 2: RQS performance across tiers.*

Each creator contributed **40 videos**:

- 10 top-performing by view count  
- 10 low-performing  
- 20 randomly sampled  

All data were sourced from **public YouTube pages**, including:

- **Video metadata:** title, tags, description, views, likes, comments, duration, and publish date  
- **Channel data:** subscriber count (for normalization)  
- **Thumbnails:** processed for color, facial detection, and textual overlays  
- **Textual content:** extracted embeddings from titles, descriptions, captions, and tags (when available)  

<img width="1828" height="927" alt="image" src="https://github.com/user-attachments/assets/2291a777-1ec5-4d6e-9c8e-589cb9d93037" />

*Figure 3: Impact of different color combinations used for the thumbnails.*

<img width="1838" height="637" alt="image" src="https://github.com/user-attachments/assets/5bfaf8b8-f313-41c7-9156-ac30d2ec6ba4" />

*Figure 4: Impact having a "face" in the thumbnail does on performance.*

<img width="3785" height="1976" alt="image" src="https://github.com/user-attachments/assets/04f73278-bd7c-419b-ae64-c24df87e6c9a" />

*Figure 5: Sentiment analysis of the comments for the videos.*

<img width="3765" height="1893" alt="image" src="https://github.com/user-attachments/assets/69f8f8bd-b30d-4748-b188-294c35b3f40d" />

*Figure 6: Title Analysis along with the winnning structure, length, and driving words (which ones increase/decrease performance.*

This structure ensured a balanced, genre-diverse dataset capable of modeling both high- and low-performance dynamics while mitigating outlier bias.

You can explore these channels and how they breakdown here:

**[Dashboard](https://youtubeextractor-production.up.railway.app/)**

You can full data visualization here:

**[Visualization](https://youtubeextractor-production.up.railway.app/visualization)**

---

## Data Preprocessing and Preparation

Data preparation included several key stages to ensure clean and usable inputs for modeling:
- **Cleaning and Normalization:** Removed missing or corrupted records, standardized numerical metrics, and normalized by subscriber count to reduce channel-size bias.  
- **Feature Engineering:** Constructed a comprehensive feature matrix including:  
  - **RQS components** (like ratio, comment ratio, sentiment score, comment depth, and timestamp density)  
  - **Visual features** (average RGB values, dominant color clusters, face detection area, and brightness)  
  - **Text embeddings** from titles, descriptions, captions, and tags  
- **Splitting:** The data were divided into training and testing sets using stratified sampling to preserve performance category representation.  
- **Encoding:** All categorical and text-based features were embedded using high-dimensional numerical representations to capture semantic relationships.
- **Modeling:** Conducted supervised learning by running analysis for the CTR, RQS, and views with different methods, optimizing and outputing the best performing model for the web application.

This preparation yielded over **160 total features**, forming a multi-modal dataset that integrates language, image, and engagement metrics. Here are the details:

### 1. Data Loading and Initial Exploration:
To start we need to load the data we collected and ensure we have the information there we want.
- Loaded the raw data from a JSON file and transformed it into a structured pandas DataFrame for easier manipulation. 
- Read the JSON file, normalized the nested 'data' column to extract channel and video information, and extracted video details into a separate DataFrame (videos_df). This preserved the original data and allowed me to perform the cleaning and later operations (which later I also make another copy as well to provide for further analysis so I wouldn't have to recreate this one in case I made a mistake I could just reload this (videos_df).
- The primary parameter is the path to the JSON file (https://github.com/mobius29er/youtubeExtractor/blob/main/extracted_data/api_only_complete_data.json).

### 2. Data Cleaning and Feature Engineering - Basic Metrics
Now that we have loaded the data we need to clean it and prepare it for our future work.
- Cleaned the data by converting data types and calculating basic performance ratios.
- Converted the (published_at) column to datetime objects allowing for better time-based analyses such as calculations, time series analysis, filtering/sorting, and feature engineering
- Converted numerical columns (view_count, like_count, comment_count) to numeric types, filling missing values with 0.
- Extracted channel subscriber counts from the normalized data and maps them to the (videos_df).
- Calculated ratios needed for RQS (used division by zero safeguards replacing ±∞ with 0; fill NaN with 0):
  - (like_ratio) = (like_count)/(view_count)
  - (comment_ratio) = (comment_count)/(view_count)
  - (views_per_subs)= (view_count)/ (channel_subs)
 
### 3. Feature Engineering - Comment Analysis
First up for FE we have comment analysis where we process the thousands upon thousands of comments and generate sentiment scores we will use later.
- Comment text extraction: Extracted and analyzed comment data, including text and sentiment.
- Note: The maximum sequence length for comment processing is set to 512.
- Average comment length: Extracted the comment text from the nested 'comments' structure and calculate the average_comment_length for each video.
- Sentiment Scoring:
  - Preprocessed comments by changing to lowercase, stripping (URLS, punctuations, etc.)
  - Installed necessary libraries (transformers, torch) and then use a pre-trained multilingual sentiment analysis model (nlptown/bert-base-multilingual-uncased-sentiment) to calculate a sentiment score for the comments of each video.
    - Used the BERT based due to its ability to handle multilingual support which was critical for this project along with being readily available and designed for sentiment analysis that I was wanting anyways.
  - Mapped 1–5 stars → [-1, 1], and average per video to get sentiment_score. Empty/malformed comment sets return 0.0 safely (applicable to family/kids genre which didn't have comments due to YouTube Policy).

### 4. Feature Engineering - Retention Quality Score (RQS)
RQS is my own metric I am developing here and for me the most important I want to use for testing as it provides us a recreation of the YouTube algorithm. Now it is important to distinguish RQS here where we are calculating it and in the web app when we process it isn't calculating the RQS for the video but rather presenting the predicted RQS which should help us determine the potential views.
- Calculated the custom RQS based on a weighted combination of normalized metrics.
- Normalized the component metrics (like_ratio, comment_ratio, views_per_subs, sentiment_score, average_comment_length) using Min-Max scaling and then calculated the RQS using predefined weights.
- Weights for RQS components:
  - like_ratio (0.30)
  - comment_ratio (0.20)
  - views_per_subs (0.25)
  - sentiment_score (0.15)
  - average_comment_length (0.10)
 
### 5. Feature Engineering - Thumbnail Image Analysis
From research and my own trial and error color, color palettes, and color combinations can have an impact on CTR, so we will extract visual features from thumbnail images, including face presence (as a % of the thumbnail), dominant colors, and color palette.
- Located the thumbnail image files based on the video_id and installed opencv-python.
- Used a Haar Cascade classifier (haarcascade_frontalface_default.xml) to detect faces in the thumbnails and calculates the percentage of the image area covered by faces.
  - Used this one due to the speed and efficiency especially since most thumbnails have well lit/frontal faces like Haar Cascade Classifier excels at.
  - Haar Cascade is also lightweight enough to be used on our Predictor in the web application so the same one used for analysis and model generation is used for doing the prediction.
- Loaded the thumbnail images using PIL and use K-Means clustering to extract dominant colors and a color palette, and calculate the average RGB values.

### 6. Feature Engineering - Thumbnail Text Extraction
Since text is sometimes embedded into the thumbnails we will extract them for analysis as well to see if it impacts the CTR.
- Extracted text content from thumbnail images using Optical Character Recognition (OCR).
- Installed Tesseract OCR and pytesseract, and then use pytesseract's image_to_string function to extract text from the thumbnail images.
- Relies on the Tesseract OCR engine installed on the system. OCR process involves:
  - Image Preprocessing: Cleaning up the image to improve text visibility (e.g., adjusting brightness, contrast, or removing noise).
  - Text Detection: Identifying areas within the image that contain text.
  - Character Recognition: Analyzing the detected text areas to identify individual characters.
  - Post-processing: Using language models and dictionaries to correct errors and improve the accuracy of the extracted text.
 
### 7. Feature Engineering - Text Embeddings
The title and the thumbnail are the biggest drivers for CTR so we will look at the title and tags next.
- Generated numerical representations (embeddings) for text features (title, tags, thumbnail_text) using a pre-trained language model.
  - Text embeddings generate numerical representations of text. This is necessary because machine learning models work with numbers, not raw text strings.
  - These numerical embeddings capture semantic meaning and relationships between words and phrases, allowing the models to understand the content of titles, tags, and thumbnail text.
- Installed sentence-transformers, loaded a multilingual model (paraphrase-multilingual-MiniLM-L12-v2), and then generated embeddings for the text columns.
  - Chose paraphrase-multilingual-MiniLM-L12-v2 because:
    - Multilingual Capability: As the dataset includes metadata in various languages this is model captures meaning across 50+ different languages.
    - Effectiveness for Semantic Similarity: This model is specifically fine-tuned for paraphrase identification and semantic similarity tasks. This means it's good at generating embeddings where texts with similar meanings are close together in the embedding space, even if they use different wording. This is valuable for understanding the content and themes of titles, tags, and thumbnail text.  This is shown in our title analysis later in the web application where we provide the top title structure.
    - "Mini" Model Efficiency: "MiniLM" indicates it's a smaller, more efficient version of larger language models. While powerful, larger models can be computationally expensive and require significant memory. A "Mini" version provides a good balance between performance and resource usage, making it more practical for generating embeddings for a dataset of this size within a Colab environment and in our web application.
    - Good Performance: Despite being smaller, MiniLM-L12-v2 models have been shown to perform well on various downstream tasks, including semantic similarity and information retrieval.

### 8. Data Preparation for Modeling
Prepared the engineered features and target variables for machine learning models.
- Selected numerical features for clustering, handled potential NaN values.
- Defined the target variables (view_count and views_per_subs) and selects predictor features.
- Split the data into training and testing sets (80% train, 20% test).
  - Test set size: 0.2 (20%)
  - Random state for reproducibility: 42

<img width="841" height="547" alt="image" src="https://github.com/user-attachments/assets/883e6b3d-e99a-4732-bcdb-904a7836ccb4" />

*Figure 7: Raw Views Log Transformed*

---

## Modeling

### Unsupervised Learning

- **Principal Component Analysis (PCA):** PCA was applied to reduce the number of features and reveal the dominant sources of patterns within the dataset. By selecting 311 principal components, I was able to capture 95% of the total variance in the scaled feature allowing the most important numerical and textual features while cutting through the noise.

<img width="846" height="547" alt="image" src="https://github.com/user-attachments/assets/3a8a4b69-fb99-465d-a521-887c1c355543" />

*Figure 8: PCA analysis: *

- **K-Means Clustering:** K-Means grouped the dataset into **five distinct clusters**, each representing a unique content archetype based on metadata, thumbnail composition, and engagement ratios. The choice of 5 clusters was initially chosen since it was the number of genres and tiers I pulled for the dataset.  This provided a starting point for exploring distinct video groupings. Cluster interpretation provided qualitative insight into how certain feature combinations correspond to higher viewer interest or specific genre styles.
- PC1 was most influenced by various thumbnail text embeddings and some tags embeddings.
- PC2 was primarily influenced by tags embeddings and some description embeddings.
- PC3 was also heavily influenced by tags embeddings and some description embeddings, but with different specific embedding dimensions being most important compared to PC2.

<img width="853" height="701" alt="image" src="https://github.com/user-attachments/assets/6603ae7f-7cbd-4e02-a8a1-51cb5f3cc48d" />

*Figure 9: K-Means Cluster Analysis: PC1 vs PC2*

<img width="853" height="701" alt="image" src="https://github.com/user-attachments/assets/6e5eada9-a525-46ca-bbed-1b83ba788460" />

*Figure 10: K-Means Cluster Analysis: PC1 vs PC3*

<img width="853" height="701" alt="image" src="https://github.com/user-attachments/assets/61bc3183-bf6b-4908-9214-3367e05e6934" />

*Figure 11: K-Means Cluster Analysis: PC2 vs PC2*

### Supervised Learning
#### Process is the same for each of the three models:
1. Original Model Idea: Starts with a certain type of model (in our case Ridge, RandomForestRegressor, and GradientBoostingRegressor). The script runs through and figures out which of the three has the best performance.
2. Tuning with GridSearchCV: Next we tune this best case model using cross-validation to find the best hyperparameters for that model type for the training data.
3. OOF Evaluation: Then the models trained with those best hyperparameters are used to generate predictions on the held-out data. The main outputs here are the OOF predictions themselves and a robust estimate of performance.
4. The Final Model: After tuning and OOF, the model is saved and used for making predictions on new, unseen data (not part of the original dataset) is a new version of the chosen model type (one of the three from step 1). This new version is then trained on the entire dataset that was used for tuning and OOF (original complete training set).

#### 1. CTR (Click-Through Rate) Model
- Description: train_ctr_standalone.py builds a model to predict the Click-Through Rate.
- Learning Type: The script uses Ridge, RandomForestRegressor, and GradientBoostingRegressor, which are all Regression models.
- Inference Inputs: The script uses a feature set (ctr_features) that includes embeddings, thumbnail/visual features, and duration. It also uses subscriber count and genre as part of the baseline model, so the final prediction incorporates all the inputs mentioned.
- Output: The script calculates and saves ctr_predicted, which is the predicted CTR proxy.
- Training Target: The target is ctr_log (defined as np.log1p(views / subs)), which is an excellent proxy for CTR. The model cleverly predicts the residual from a baseline, which is an advanced and robust technique.

#### 2. Retention Quality Score (RQS) Model
- Description: train_rqs_standalone.py predicts the Retention Quality Score.
- Learning Type: It uses the same set of Regression models as the CTR script.
- Inference Inputs: The script explicitly creates a feature set (rqs_features) that excludes post-publish data (views, likes, etc.), matching the "Pre-publish inputs only" description perfectly.
- Output: The script calculates and saves rqs_predicted. The RQS score itself is normalized to a 0-100 scale using a sigmoid function, just as the table implies.
- Training Target: The target is the rqs_score, which is calculated from post-publish engagement metrics like like ratio and comment depth. This perfectly matches the "RQS_true (post-publish index)" description.

#### 3. Views per Subscriber Prediction
- Predicting raw view counts was initially difficult due to the heavy-tailed nature of YouTube data. Early models performed worse than a simple mean predictor, resulting in negative R² values.  
- Applying a **logarithmic transformation** to the target variable stabilized the variance and significantly improved performance
- Description: train_views_standalone.py forecasts video views.
- Learning Type: It uses the same set of Regression models.
- Inference Inputs: The script's primary features are the predictions from the other two models (ctr_oof_predictions, rqs_oof), along with subscriber count (log_subs) and other metadata. It also uses a log residual approach and calculates guardrails, matching your table's description with high fidelity.
- Output: The script calculates and saves views_predicted.
- Training Target: The training target is explicitly set as the log-transformed view count (y_views_log), which is then winsorized.

**🔮 [Try the Predictor](https://youtubeextractor-production.up.railway.app/predictor)**

---

## Model Evaluation

Evaluation relied primarily on **R²**, **MAE**, and **RMSE** metrics to quantify accuracy and generalization.

| Model | Final R² | MAE | RMSE | Core Predictors | Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RQS Model** | 0.7859 | 5.01 | 6.60 | sentiment_score, description/caption embeddings | Emotional tone predicts retention strength |
| **Views Model** | 0.7061 | 1.48 (log-scale) | 1.98 (log-scale) | ctr_subs_interaction, rqs_pred, log_subs | Engagement and audience size synergy drives views |
| **CTR Model** | 0.4700 | 0.32 | 0.51 | rqs_pred, tag/title embeddings | Retention and textual clarity influence click rate |

### Key Findings
- The **logarithmic transformation** was critical for modeling raw views due to the heavy-tailed distribution of the data.  
- **Engagement metrics** (like_ratio, comment_ratio, sentiment_score) and **metadata embeddings** consistently ranked among the most important predictors.  
- **Thumbnail color composition** correlated with performance, suggesting visual tonality may play a subconscious role in attracting viewers.  
- **High RQS videos** tended to share “success signatures” of emotional positivity, strong early engagement, and well-composed thumbnails.
- 
#### CTR
- The CTR model achieved **R² = 0.4700**, reflecting moderate but actionable predictive power.
- Embeddings from titles, tags, and thumbnail text further refined the model, capturing the importance of linguistic framing and presentation in generating clicks.
- The strongest predictor was the **predicted RQS**, implying that users are more likely to click on content they subconsciously associate with high retention quality.

#### RQS
- The RQS model achieved a strong and valid **R² of 0.7859**, making it the foundation of this system and succeeded in mirroring the YouTube algorithm
- RQS was designed to **mirror the internal logic of the YouTube recommendation algorithm**, which prioritizes videos that sustain viewer attention and evoke strong emotional engagement.  
- The model replicates this mechanism by integrating **five weighted components**:
  - **Like Ratio (30%)** – Measures satisfaction and perceived content quality.
  - **Comment Ratio (20%)** – Reflects active viewer engagement and emotional response.
  - **Views per Subscriber (25%)** – Normalizes reach relative to audience size.
  - **Sentiment Score (15%)** – Captures the emotional polarity of comments, serving as a proxy for audience resonance.
  - **Comment Depth and Timestamp Density (10%)** – Estimates retention through the presence of detailed or time-stamped feedback.  

- Together, these components emulate how YouTube’s algorithm balances click performance, retention, and satisfaction signals when recommending content.  
- Feature importance analysis confirmed that **sentiment_score** is the dominant variable, followed by textual embeddings from the description and captions. This indicates that emotional tone and linguistic clarity drive sustained watch behavior, much like how YouTube’s engagement-weighted ranking system prioritizes emotionally compelling and clear communication.

#### Views
- Predicting normalized success (views per subscriber) achieved consistent results, with both Gradient Boosting and Random Forest models reaching **R² values of 0.7061**.  
- This model focused on engagement-driven metrics rather than raw exposure, identifying how viewer loyalty, content tone, and thumbnail quality predict proportional success.

---

## Conclusions and Future Work

This research successfully developed a model so a creator can predict a YouTube video's success using pre-publication features alone. The combination of textual, visual, and engagement-based features produced a coherent framework capable of forecasting retention, engagement, and viewership before a video is released.

The **RQS model** not only serves as the most correlative predictor of performance but also **approximates the fundamental logic of YouTube’s recommendation system/algorithm**. Just as YouTube optimizes for viewer satisfaction and sustained attention, the RQS model reproduces the algorithm through sentiment, engagement ratios, and audience (normalized by subscriber count). This score therefore can be used as a YouTube algorithm proxy ranking for videos and potentially entire channels.

The **log-views model** offers predictions for reach, while the **CTR model** predicts pre-click interest with post-click retention and allows the user to modify and retest their titles and thumbnails for CTR optimization. Together, they form a framework that works across channels size of brand new all the way to "Mega" tiers of 50 million plus subscribers that can forecast outcomes and guide optimization before a video ever goes live.

### Future Development Priorities

1. Incorporating full video transcripts and hook analysis to better quantify narrative quality.  
2. Refining the RQS formula using additional sentiment layers and long-tail engagement metrics.
3. Providing for better optimization: generating titles, thumbnails, rapid iterations, etc.   

Ultimately, this project lays the groundwork for a **predictive YouTube optimization platform** that transforms the art of content creation into a measurable, data-informed science, while offering a peak into the YouTube algorithm.  That way creators can focus more on writing their scripts and less about worrying about how their titles and thumbnails will perform as they will have a predictive performance before they even hit publish.

---

## Application Implementation and Visualization Layer

Following model development, the complete web application titled **YouTube Extractor** was built to operationalize the findings. The app provides a **user-friendly dashboard and ML interface** that allows creators, researchers, and analysts to interact with the trained models and visualize performance data.

### Platform Overview

The system is hosted at [YouTubeextractor-production.up.railway.app](https://YouTubeextractor-production.up.railway.app) and integrates all core modules:

- **Dashboard:** Overview of extracted data (1,000 videos across 25 channels) with real-time health scoring and data verification metrics.  
- **Data Visualization:** Interactive insights across genre, engagement tier, sentiment, correlation, and thumbnail color analytics.  
- **AI Predictor:** User-facing form that allows prediction of view counts, RQS, and engagement by inputting title, genre, subscriber count, duration, and optional thumbnail upload.  
- **Status Module:** Real-time monitoring of system uptime, channel extraction completion, and dataset integrity.

### Key Visualization Modules

#### 1. Genre and Tier Analysis
- Displays comparative engagement and RQS metrics across genres such as Kids/Family, Gaming, Challenge/Stunts, Education, and Catholic content.  
- Channel tier segmentation (Mega, Large, Mid, Small, New) reveals how scale interacts with engagement efficiency.

#### 2. Sentiment Analysis Dashboard
- Visualizes positive, neutral, and negative comment distributions and generates corresponding word clouds.  
- Demonstrates that positive sentiment words (“Jesus,” “Catholic,” “bless,” “pray”) correlate strongly with higher RQS outcomes.

#### 3. Thumbnail Analysis Suite
- Extracts and ranks dominant thumbnail colors, face detection percentages, and composition ratios.  
- Identifies high-performing color combinations such as **Black + White + Red-Orange**, which achieved top RQS values (~22.0).  
- Face detection analysis revealed that thumbnails with **0% face presence** performed best for large-scale Kids and Family content, highlighting genre-dependent optimization.

#### 4. Title Analysis Engine
- Evaluates over 1,000 titles, identifying optimal structures and lengths.  
- The highest RQS performance occurred for **titles between 40–49 characters** and “How to {skill}” structures, with “Catholic” emerging as the single most performance-boosting word (+40%).  
- Word cloud and leaderboard features quantify which linguistic features statistically improve retention and engagement.

#### 5. Correlation and Engagement Tools
- The correlation matrix plots relationships between engagement ratios (like_ratio, comment_ratio), RQS, and views per subscriber.  
- Provides actionable insights into which metrics most strongly predict success, validated visually through scatter and bar plots.

### Operational Impact

This application moves the research beyond theory. It **translates the model suite into a dynamic visual intelligence platform** capable of:
- Running **live predictions** through trained ML models.  
- Generating **AI-driven insights** on thumbnails, titles, and engagement factors.  
- Offering creators a **replicable success framework** by identifying high-performing “signatures” across visual and textual elements.

The **YouTube Extractor** serves as both a **machine learning research artifact** and a **working application for an AI-powered creator analytics platform**, bridging the gap between academic modeling and practical industry application.

---

### 🏗️ System Architecture Overview

#### 🎯 Core Components
##### 1. Frontend Layer (React + Vite)
###### Why React/Vite?
I chose React + Vite due to the ease of development and performance of this setup. React’s component model and hooks make it ideal for dynamic, data-driven UIs, while Vite’s lightning-fast bundler enables quick iteration during development. Combined it provides a modern, visually appealing look most people are accustomed to, which makes it user friendly.
```
📦 frontend/
├── React 18 with modern hooks and components
├── Vite build system for fast development
├── Tailwind CSS for responsive styling
├── Lucide React icons and interactive UI
└── Real-time prediction interface
```
Key Components:
- VideoPerformancePredictor.jsx: Main ML prediction interface
- Dashboard.jsx: Data analytics and insights
- DataVisualization.jsx: Charts and performance metrics
- Navigation.jsx: App routing and user flow

##### 2. Backend Services (Python/FastAPI)
###### Why Python/FastAPI?
I chose Python + FastAPI due to the ease of development and performance of this setup. It is fast and scalable and works well for processing data via machine learning and the ML stack (NumPy / Pandas / scikit-learn / OpenCV). 

I split them into two different servers, which added to the complexity and effort to get to work seamlesslesly, to provide better performance, future development and scalability.  
###### Service A: Dashboard API (Port 8000) – serves the React app and exposes read-only analytics/endpoints.
The lightweight server for serving the fast-loading user interface and providing historical analytics data.

src/api_server.py 
- Data extraction and management
- Static React frontend serving
- YouTube Data API integration
- Dataset analysis and reporting
- Health monitoring endpoints

###### Service B: ML Prediction API (Port 8002) – dedicated ML inference service.
The heavy-duty, dedicated inference engine isolated to run complex Computer Vision and sequential ML models without delaying the user interface.

src/prediction_api.py 
- 24+ trained machine learning models
- Real-time video performance prediction
- Computer vision thumbnail analysis
- Text processing and embeddings
- Feature engineering pipeline

This separation provides performance isolation (heavy ML calls can’t slowdown the dashboard), enables independent scaling and deployments, and keeps the codebases loosely coupled for future changes.  

###### Scaling options: For higher throughput I can:
- Add workers (Uvicorn/Gunicorn) and enable async I/O.
- Introduce a message queue (Redis/NATS/RabbitMQ) for bursty inference.
- Cache identical requests at the gateway (Redis) with short TTLs.

###### Future Scaling
As the prediction models becomes more sophisticated it could require changes to the database and even though I set them both up to run on python/FastAPI I could migrate the visualization/frontend/dashboard server to Elixir Phoenix for blazing fast performance at scale or Fastify/NestJS to keep it developer friendly with still great performance.  It also provides for better performance at scale having the two servers in the future (not an issue at all currently).  

##### 3. Machine Learning Pipeline
###### 🤖 ML Architecture (30+ Models)
```
├── CTR Models: Click-through rate prediction (R² = 0.47)
├── RQS Models: Retention Quality Score (R² = 0.79)
├── Views Models: View count forecasting (R² = 0.70)
├── Text Embeddings: TF-IDF + SVD for titles/descriptions
├── Computer Vision: Face detection, color analysis
└── Feature Engineering: 131-dimensional feature space
```

###### 🔄 Data Flow & Processing
```
Prediction Pipeline
User Input → Feature Engineering → ML Models → Results
    ↓              ↓                 ↓         ↓
Title/Genre → Text Embeddings → CTR Model → Performance Score
Thumbnail → Computer Vision → RQS Model → Confidence Rating
Channel → Normalization → Views Model → Final Predictions
```
##### 5. Data Layer
###### 📊 Data Sources & Storage
```
├── extracted_data/: 1,000+ video training dataset
├── models/: Serialized ML models (joblib format)
├── thumbnails/: Computer vision training images
├── comments_raw/: Sentiment analysis data
└── YouTube Data API v3 integration
```
##### 6. 🐳 Deployment Architecture
Multi-Stage Docker Strategy
Docker was chosen for the YouTube Performance Predictor because it unifies complex dependencies across Python, Node.js, and ML models into a single, consistent environment. Main reason why I chose it was for its portability, having it built with Docker I can migrate easily to AWS, Azure, etc. from Railway.  Its multi-stage builds cut image size and speed up deployments, while containerization allows the React dashboard and heavy ML predictor to scale independently. Docker ensures version control for models, isolates environments, and guarantees that what works locally works in production. With caching, health checks, and platform portability, it provides a fast, reliable, and reproducible foundation that makes the project scalable, maintainable, and production-ready.   
###### Dockerfile (Dashboard Service)
```
├── Stage 1: Node.js (React build)
│   ├── npm ci (4 seconds with package-lock.json)
│   ├── Vite build compilation
│   └── Static asset generation
└── Stage 2: Python runtime
    ├── FastAPI backend
    ├── Static file serving
    └── Health checks
```
###### Dockerfile.prediction (ML Service)
```
├── Python 3.12 with ML dependencies
├── OpenCV for computer vision
├── 200MB+ model files
├── Extended health check (180s startup)
└── Isolated inference service
```
##### 7. Railway Cloud Deployment
Railway was chosen for the YouTube Performance Predictor because it provides the simplest, fastest, and most cost-effective way to deploy Docker-based multi-service apps with zero-config Docker support, instant GitHub integration, and automatic health checks. It allows both the lightweight React dashboard and the heavy ML predictor to run independently with full reliability, which was a main requirement/need for the architecture I was designinig. Deployments take under 10 minutes, cost just $15–20 per month, and require no YAML or complex DevOps setup. Railway also offers real-time logs, auto-SSL, environment variable management, and easy rollback perfect for an MVP-stage project without vendor lock-in. Railway let me focus on building, not managing infrastructure.
###### ☁️ Production Infrastructure
```
├── Automatic GitHub CI/CD
├── Container orchestration
├── Environment management
├── Domain: youtubeextractor-production.up.railway.app
└── Build time: 7 minutes (optimized from 11+)
```

---

## 📊 What This Does

Transform your video ideas into data-driven decisions:

- **🎯 CTR Prediction**: Forecast click-through rates with validated R² of 0.47
- **📈 View Forecasting**: Predict expected views based on your channel size
- **🏆 RQS Scoring**: Get retention quality scores (0-100)
- **🖼️ Thumbnail Analysis**: Computer vision insights on colors, faces, text
- **🏷️ Smart Tag Recommendations**: AI-generated tags based on title and genre
- **⚡ Real-Time Predictions**: Get results in seconds, not hours

### Live Example
```
Input: "24 Hours in Adoration" (Challenge, 10K subs, 8 min)
Output: 
├── CTR: 20.59% (Excellent)
├── Views: 2.1K (Above average)
├── RQS: 41.31% (Good retention)
└── Tags: [challenge, stunts, extreme, amazing, 2025]
```

---

## 🧠 ML Architecture

### Sequential Prediction Pipeline
```
Video Data → CTR Model → RQS Model → Views Model → Performance Score
     ↓           ↓           ↓           ↓
  Features   Baseline+    Advanced     Guardrails
   (411)    Residual     Features      Applied
```

### Model Details
- **CTR Model**: 411 features including text embeddings, thumbnail analysis, duration
- **RQS Model**: 411 features for retention quality prediction
- **Views Model**: 17 features using CTR/RQS predictions + channel metrics
- **Computer Vision**: OpenCV pipeline for face detection, color analysis
- **Text Processing**: TF-IDF + SVD embeddings for titles, descriptions, tags

### Training Data
- **1,000+ YouTube videos** across 5 genres
- **25 top creators** (MrBeast, Kurzgesagt, Jacksepticeye, etc.)
- **Real performance metrics** from YouTube Data API
- **Intelligent sampling**: Top/bottom/random video selection

---

## 🎨 User Interface

### Modern, Responsive Design
- **🌙 Dark/Light Theme**: Automatic theme switching
- **📱 Mobile Optimized**: Works on all devices
- **⚡ Real-Time**: Instant predictions with loading states
- **🎯 Smart Forms**: Duration input, genre selection, thumbnail upload
- **📊 Visual Results**: Clean charts and confidence indicators

### Key Features
- **Thumbnail Upload**: Drag-and-drop with preview
- **Smart Defaults**: 8-minute duration, intelligent tag generation
- **Confidence Scoring**: Visual indicators for prediction reliability
- **Error Handling**: Graceful fallbacks and user feedback

---

## 🚀 Technology Stack

### Backend (Python)
```python
FastAPI          # High-performance API framework
scikit-learn     # Machine learning models
OpenCV           # Computer vision processing
NumPy/Pandas     # Data processing
joblib           # Model persistence
PIL              # Image processing
```

### Frontend (React)
```javascript
React 18         # Modern UI framework
Tailwind CSS     # Utility-first styling
Lucide Icons     # Beautiful icons
Responsive       # Mobile-first design
```

### Infrastructure
```yaml
Docker:          # Containerized deployment
Railway:         # Cloud hosting platform
GitHub Actions:  # CI/CD pipeline
Git LFS:         # Large model file storage
```

---

## 📁 Project Structure

```
📦 YouTube Performance Predictor
├── 🤖 models/                          # Complete ML pipeline (24 trained models)
│   ├── ctr_model.joblib               # CTR prediction model
│   ├── ctr_baseline.joblib            # CTR baseline features
│   ├── ctr_features.joblib            # CTR feature engineering
│   ├── rqs_model.joblib               # RQS prediction model  
│   ├── rqs_features.joblib            # RQS feature engineering
│   ├── rqs_weights.joblib             # RQS ensemble weights
│   ├── views_baseline_model.joblib    # Views baseline predictor
│   ├── views_residual_model.joblib    # Views residual predictor
│   ├── views_guardrails.json          # Views prediction bounds
│   ├── tfidf_*.joblib                 # Text embedding models (5 files)
│   └── svd_*.joblib                   # Dimensionality reduction (5 files)
├── 🔥 src/                            # Backend services
│   ├── prediction_api.py              # Main ML prediction API
│   ├── api_server.py                  # Legacy data extraction API
│   ├── corrected_data_extractor.py    # YouTube data collector
│   ├── dataset_analyzer.py            # Training data analysis
│   └── supplementary_analysis.py      # Additional analytics
├── ⚛️ frontend/                       # React dashboard application
│   ├── src/
│   │   ├── components/                # UI components
│   │   │   ├── VideoPerformancePredictor.jsx  # Main prediction interface
│   │   │   ├── Dashboard.jsx          # Data overview dashboard
│   │   │   ├── DataVisualization.jsx  # Interactive charts
│   │   │   ├── ComparisonAnalytics.jsx # Video comparison tools
│   │   │   ├── AllVideosModal.jsx     # Video library viewer
│   │   │   ├── VideoDetailsModal.jsx  # Individual video details
│   │   │   ├── FilterControls.jsx     # Data filtering options
│   │   │   ├── Navigation.jsx         # App navigation
│   │   │   └── ExtractionStatus.jsx   # Real-time status
│   │   ├── utils/                     # Helper functions
│   │   ├── App.jsx                    # Main React app
│   │   └── main.jsx                   # React entry point
│   ├── package.json                   # Node.js dependencies
│   └── public/                        # Static assets
├── � extracted_data/                 # Training datasets & outputs
│   ├── api_only_ml_dataset.csv        # ML-ready training data
│   ├── YouTube_channel_data.json      # Channel metadata
│   ├── metadata_only.json             # Video metadata
│   ├── caption_availability_report.json # Caption analysis
│   ├── thumbnails/                    # Downloaded thumbnail images
│   └── comments_raw/                  # Raw comment data
├── 📋 scripts/                        # Development & analysis tools
│   ├── analysis/                      # Data analysis scripts
│   ├── cleanup/                       # Data cleaning utilities
│   ├── utilities/                     # Helper scripts
│   └── verification/                  # Data validation tools
├── �🐳 Docker & Deployment             # Container & hosting config
│   ├── Dockerfile.prediction          # ML prediction service
│   ├── Dockerfile                     # Dashboard service, Frontend and Data Visualization
│   ├── railway.toml                   # Railway deployment config
│   ├── Procfile                       # Process definitions
│   └── deploy-railway.sh/.bat         # Deployment scripts
├── 📚 Documentation                   # Project documentation
│   ├── README.md                      # This file
│   ├── STARTUP_GUIDE.md               # Setup instructions
│   ├── RAILWAY_DEPLOY.md              # Deployment guide
│   ├── COMMERCIAL_STRATEGY.md         # Business strategy
│   └── docs/                          # Additional documentation
├── � Configuration                   # Environment & settings
│   ├── requirements-prediction.txt    # ML service dependencies
│   ├── requirements-railway.txt       # Railway dependencies
│   ├── requirements.txt               # Full dependencies
│   ├── .env.prediction                # ML service environment
│   ├── .github/                       # GitHub Actions CI/CD
│   └── config/                        # App configuration files
├── �️ Development Resources           # Development assets
│   ├── notebooks/                     # Jupyter analysis notebooks
│   ├── colab/                         # Google Colab notebooks
│   ├── analysis_output/               # Analysis results
│   ├── logs/                          # Application logs
│   ├── backups/                       # Data backups
│   └── archive/                       # Development history
└── 🧪 Testing & Validation            # Testing resources
    ├── test_prediction.py             # API testing script
    ├── test-prediction-url.html       # Web testing interface
    └── __pycache__/                   # Python cache files
```

---

## 🎯 Genres Supported

| Genre | Examples | CTR Support |
|-------|----------|-------------|
| 🎮 Gaming | Jacksepticeye, Call Me Kevin | ✅ Full |
| 🔬 Education/Science | Kurzgesagt, Veritasium | ✅ Full |
| 🎯 Challenges/Stunts | MrBeast, Ryan Trahan | ✅ Full |
| ⛪ Christian/Catholic | Bishop Barron, Ascension | ✅ Full |
| 👨‍👩‍👧‍👦 Kids/Family | Cocomelon, Diana and Roma | 🔶 Limited |

---

## 🚀 Quick Start

### Try the Live Demo
Visit **[YouTube Performance Predictor](https://YouTubeextractor-production.up.railway.app/)** to test immediately.

## 🛠️ Installation & Setup

### 1. Quick Installation
```
git clone https://github.com/mobius29er/YouTubeExtractor.git
cd YouTubeExtractor
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file:
```
YouTube_API_KEY=your-api-key-here
```

### 2. Local Development

#### Prerequisites
- **Python 3.11+** (recommended - avoid 3.13+ due to compatibility issues)
- **Node.js 18+** and npm
- **YouTube Data API v3 Key** (get from [Google Cloud Console](https://console.cloud.google.com/))

#### Complete Setup
##### 1. Clone repository
```
git clone https://github.com/mobius29er/YouTubeExtractor.git
cd YouTubeExtractor
```
##### 2. Backend setup
##### Create virtual environment (recommended)
```
python -m venv venv
```
##### Windows:
```
venv\Scripts\activate
```
##### macOS/Linux:
```
source venv/bin/activate
```

##### Install dependencies
```
pip install -r requirements.txt
```
##### 3. Environment configuration
##### Copy and configure environment files
```
cp .env.prediction .env
```
##### Edit .env and add your YouTube API key:
```
YouTube_API_KEY=your_api_key_here
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

##### 4. Data setup (optional - for full functionality)
##### If you have extracted data, place it in extracted_data/
##### Or run data extraction first:
```
python src/corrected_data_extractor.py
```
##### 5. Start backend API server
```
python src/api_server.py
```
##### Alternative for ML predictions:
```
python src/prediction_api.py
```
##### 6. Frontend setup (new terminal)
```
cd frontend
npm install
```

##### Create local environment file
```
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```
##### Start frontend development server
```
npm run dev
```
##### 7. Access your application:
##### Main API: http://localhost:8000
##### ML Prediction API: http://localhost:8002  
##### Frontend Dashboard: http://localhost:3000


#### Troubleshooting
- **Port conflicts**: Change ports in `.env` files if needed
- **CORS issues**: Ensure backend CORS_ORIGINS includes `http://localhost:3000`
- **Missing data**: Run data extraction or use sample data from `extracted_data/`
- **API key**: Verify YouTube Data API v3 is enabled in Google Cloud Console

### 3. Docker Deployment
# Build and run prediction service
```
docker build -f Dockerfile.prediction -t YouTube-predictor .
docker run -p 8002:8002 YouTube-predictor
```

---

## 📈 Model Performance

### Prediction Accuracy
- **CTR Model**: R² = 0.4700
- **RQS Model**: R² = 0.7859
- **Views Model**: R² = 0.7061

### Feature Importance
1. **Text Embeddings** (40%): Title, description, tags
2. **Thumbnail Features** (25%): Face detection, colors, brightness
3. **Channel Metrics** (20%): Subscriber count, genre
4. **Video Properties** (15%): Duration, upload timing

### Confidence Levels
- **High**: All features available, thumbnail uploaded
- **Medium**: Missing thumbnail or limited text
- **Low**: Minimal feature set or edge cases

---

## 🎨 API Documentation

### Prediction Endpoint
```http
POST /api/predict
Content-Type: multipart/form-data

title: string (required)
genre: string (required) 
subscriber_count: integer (required)
duration_seconds: integer (optional, default: 480)
thumbnail: file (optional)
```

### Response Format
```json
{
  "predicted_views": 2100,
  "predicted_rqs": 41.31,
  "predicted_ctr_percentage": 20.59,
  "performance_score": 85.2,
  "thumbnail_analysis": {
    "brightness": 180.8,
    "has_faces": false,
    "face_percentage": 0.0
  },
  "input_data": {
    "recommended_tags": ["challenge", "stunts", "extreme"],
    "duration_minutes": 8.0
  },
  "confidence_score": 0.85,
  "model_version": "3.1"
}
```

---

## 🔬 Research Applications

### Academic Use Cases
- **Creator Economy Research**: Understanding success factors
- **ML Model Comparison**: Benchmark against your models  
- **Computer Vision**: Thumbnail impact analysis
- **NLP Applications**: Text embedding effectiveness

### Business Applications
- **Creator Tools**: Integrate predictions into existing platforms
- **Content Strategy**: Data-driven video planning
- **Marketing Analytics**: Campaign performance forecasting
- **A/B Testing**: Compare different video concepts

---

## 🚧 Future Roadmap

### Short Term (Q4 2025)
- [ ] **User Accounts**: Save prediction history
- [ ] **Batch Processing**: Multiple video analysis
- [ ] **Model Metrics**: Display accuracy statistics
- [ ] **Monetization**: Premium features and API access

### Medium Term (2026)
- [ ] **Real-Time Training**: User feedback improves models
- [ ] **Competitor Analysis**: Compare against similar channels
- [ ] **Trend Detection**: Identify emerging content patterns
- [ ] **API Rate Limiting**: Production-ready scaling

### Long Term (Future)
- [ ] **YouTube Studio Integration**: Official plugin
- [ ] **Multi-Platform Support**: TikTok, Instagram predictions
- [ ] **Advanced CV**: Thumbnail generation suggestions

---

## 🤝 Contributing

### Development Setup
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Areas for Contribution
- **Model Improvements**: Better algorithms, feature engineering
- **UI/UX Enhancements**: Design improvements, new components
- **Documentation**: Tutorials, API docs, examples
- **Testing**: Unit tests, integration tests, performance tests

---

## 📊 Model Training Data

If you're interested in the training process:

```bash
# Training data available in extracted_data/
api_only_ml_dataset.csv      # 1,000+ videos with features
YouTube_channel_data.json    # Raw channel metrics
thumbnails/                  # Image training data
comments_raw/               # Sentiment analysis data
```

### Data Collection Methodology
- **Intelligent Sampling**: Top 10, bottom 10, random 20 per creator
- **Multi-Genre Coverage**: 5 distinct content categories  
- **Quality Filtering**: >3 minutes, English content
- **Ethical Sourcing**: Public data only, API compliant

---

## 📄 License

```
Copyright (c) 2025 Jeremy Foxx

```

---

## 🙌 Acknowledgments

### Inspiration
- **MrBeast**: Data-driven content creation philosophy
- **Creator Economy**: The need for better prediction tools
- **Open Source ML**: Providing all the frameworks to help me complete this project

### Technology Credits
- **scikit-learn**: Machine learning framework
- **OpenCV**: Computer vision capabilities  
- **FastAPI**: High-performance web framework
- **React**: Modern UI development
- **Railway**: Seamless deployment platform

### Dedication
- **God** for granting me strenght to complete this even during illness
- **My wife** for her support even during long work hours
- **My family** for all their support of us and believing in me

---

## 🎯 Author

**Jeremy Foxx**  
*Creator • Engineer • Catholic*

- 🌐 **Live Demo**: [YouTube Performance Predictor](https://YouTubeextractor-production.up.railway.app/)
- 📧 **Contact**: jeremy@foxxception.com
- 💼 **LinkedIn**: https://www.linkedin.com/in/jeremyfoxx/
- 🐦 **Twitter**: https://x.com/jeremydfoxx

---

⭐ **Star this repository** if you believe creators deserve AI-powered tools!

*Built for the creator economy*
