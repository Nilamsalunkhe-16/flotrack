"""
Women's Health Chatbot Knowledge Base
Contains Q&A about common women's health concerns
"""

KNOWLEDGE_BASE = {
    "periods": {
        "normal_cycle": "A normal menstrual cycle typically lasts 21-35 days, with bleeding lasting 3-7 days. Every person is different, so your normal might vary slightly.",
        "heavy_periods": "Heavy periods (menorrhagia) involve excessive bleeding lasting more than 7 days. Consider iron supplements, visit a doctor if severe, and track your cycle to share patterns with your healthcare provider.",
        "irregular_periods": "Irregular periods can be caused by hormonal changes, stress, exercise, weight changes, or medical conditions like PCOS. Track your cycle and consult a doctor if it persists.",
        "period_pain": "Menstrual cramps are caused by uterine contractions. Relief options include: heat pads, ibuprofen, gentle exercise, hydration, and stretching. See a doctor if pain is severe.",
        "missed_period": "Missed periods can be due to pregnancy, stress, hormonal imbalances, extreme weight loss, or exercise. If you're not pregnant and it persists, see a doctor.",
        "period_symptoms": "Common period symptoms include: cramps, bloating, mood changes, breast tenderness, fatigue, and food cravings. These usually last a few days.",
    },
    "pcos": {
        "what_is_pcos": "PCOS (Polycystic Ovary Syndrome) is a hormonal condition affecting the ovaries. Symptoms include irregular periods, excess hair growth, acne, weight gain, and fertility issues.",
        "pcos_symptoms": "PCOS symptoms: irregular/absent periods, excess body/facial hair, acne, weight gain or difficulty losing weight, male pattern baldness, skin darkening.",
        "pcos_diagnosis": "PCOS is diagnosed through: blood tests (hormone levels), ultrasound (ovarian cysts), and ruling out other conditions. See a gynecologist for proper diagnosis.",
        "pcos_management": "PCOS management: regular exercise, healthy diet (low glycemic index), birth control pills, metformin, weight loss if overweight, and stress management.",
        "pcos_fertility": "Women with PCOS can get pregnant. Treatment options include: weight loss, fertility medications, and assisted reproductive techniques. Consult a fertility specialist.",
    },
    "anemia": {
        "what_is_anemia": "Anemia is having low red blood cells or hemoglobin, reducing oxygen delivery to your body. Common symptoms: fatigue, weakness, shortness of breath, dizziness.",
        "anemia_symptoms": "Anemia symptoms: extreme fatigue, weakness, pale skin, shortness of breath, cold hands/feet, dizziness, and headaches. Symptoms vary by severity.",
        "iron_deficiency": "Iron-deficiency anemia is common in women due to periods. Increase iron intake: red meat, spinach, lentils, beans. Consider iron supplements and get tested.",
        "heavy_periods_anemia": "Heavy periods can cause iron-deficiency anemia. If you have heavy periods and fatigue, get blood tests for anemia. Treat heavy periods to prevent anemia.",
        "anemia_treatment": "Anemia treatment depends on the cause: iron supplements, B12 injections, diet changes, treating underlying conditions, or in severe cases, transfusions.",
    },
    "pregnancy": {
        "pregnancy_signs": "Early pregnancy signs: missed period, breast tenderness, nausea, fatigue, frequent urination, mood changes, and food cravings.",
        "pregnancy_test": "Best time to take a pregnancy test: after a missed period (1-2 weeks). Blood tests are more accurate than urine tests and earlier to detect.",
        "prenatal_care": "Prenatal care includes: regular doctor visits, ultrasounds, blood tests, blood pressure checks, and nutritional counseling. Start as soon as you confirm pregnancy.",
        "pregnancy_nutrition": "During pregnancy: need extra 300 calories/day, folic acid (prevents birth defects), iron (prevents anemia), calcium, protein, and stay hydrated.",
    },
    "reproductive_health": {
        "contraception": "Birth control options: pills, patches, shots, IUDs, implants, condoms, and permanent methods. Each has pros/cons. Consult a doctor for best choice.",
        "sti_prevention": "Prevent STIs: use condoms, get tested regularly, communicate with partners, limit partners, and get vaccinated (HPV vaccine).",
        "cervical_health": "Get regular Pap smears (cervical cancer screening). HPV vaccine can prevent cervical cancer. Practice safe sex and know your sexual health status.",
        "breast_health": "Breast health tips: do self-exams monthly, know your normal breast changes, get mammograms as recommended by age, and report lumps to a doctor.",
    },
    "menopause": {
        "menopause_age": "Menopause typically occurs between 45-55 years old. It's marked by 12 consecutive months without a period and marks the end of reproductive years.",
        "menopause_symptoms": "Menopause symptoms: hot flashes, night sweats, mood changes, sleep issues, weight gain, joint pain, and vaginal dryness. Symptoms vary in duration and severity.",
        "hot_flashes": "Hot flashes: sudden intense heat, sweating, racing heartbeat lasting minutes to hours. Manage with: cool clothing, fans, deep breathing, avoiding triggers like caffeine.",
        "hormone_therapy": "Hormone replacement therapy (HRT) can relieve menopause symptoms. Benefits and risks exist. Discuss with your doctor if HRT is right for you.",
    },
    "general_health": {
        "exercise_benefits": "Regular exercise (150 min/week): improves mood, strengthens bones, maintains weight, reduces disease risk, boosts energy, and manages cycle symptoms.",
        "nutrition": "Balanced diet for women's health: fruits, vegetables, whole grains, lean proteins, healthy fats, limit sugar/processed foods, and stay hydrated.",
        "mental_health": "Women's mental health: manage stress through exercise, meditation, therapy, social support, and rest. Hormonal changes can affect mood—seek help if needed.",
        "sleep_hygiene": "Good sleep: maintain schedule, cool/dark room, limit screens before bed, avoid caffeine/alcohol, exercise daily, and manage stress for better sleep.",
    }
}

def get_all_topics():
    """Return all available topics"""
    topics = []
    for category, questions in KNOWLEDGE_BASE.items():
        for question_key in questions.keys():
            topics.append(f"{category.replace('_', ' ')}: {question_key.replace('_', ' ')}")
    return topics

def search_knowledge_base(query: str) -> str:
    """
    Search knowledge base for relevant answer
    Returns answer if found, else returns generic response
    """
    query_lower = query.lower().strip()
    
    # Search through all knowledge base entries
    for category, qa_pairs in KNOWLEDGE_BASE.items():
        for key, answer in qa_pairs.items():
            # Check if query matches the key or contains keywords from the key
            key_words = key.replace('_', ' ').split()
            query_words = query_lower.split()
            
            # If key is found in query or query contains key words
            if key.replace('_', ' ') in query_lower or any(word in query_lower for word in key_words):
                return answer
    
    # If no exact match, try keyword matching
    for category, qa_pairs in KNOWLEDGE_BASE.items():
        for key, answer in qa_pairs.items():
            key_phrase = key.replace('_', ' ')
            if any(keyword in query_lower for keyword in key_phrase.split()):
                return answer
    
    # Default response if no match found
    return "I'm not sure about that. I can help with questions about: periods, PCOS, anemia, pregnancy, reproductive health, menopause, and general women's health. What would you like to know?"
