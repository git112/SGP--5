import os
from typing import List, Dict, Any

from huggingface_hub import InferenceClient


_HF_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
if not _HF_API_KEY:
    raise RuntimeError("Missing HUGGING_FACE_API_KEY in environment")

_client = InferenceClient(token=_HF_API_KEY)


def _chat_completion(messages: List[Dict[str, str]], max_tokens: int = 800) -> str:
    response = _client.chat_completion(
        model="mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages=messages,
        max_tokens=max_tokens,
    )
    return response.choices[0].message["content"].strip()


def summarize_resume_text(raw_text: str) -> str:
    prompt = f"""
You are an expert resume reviewer.

Extract and summarize the following structured information from the resume text below:

Resume:
{raw_text}

Return the summary in this format:

- Education: <highest degree, major, college name, year>
- Projects: <2–3 notable projects with tech stack and outcome>
- Experience: <Key roles, company names, durations, responsibilities>
- Skills: <Most relevant technical and soft skills>
- Achievements: <Notable awards, recognitions, rankings>

If any category is missing, simply write "Not mentioned".
"""

    try:
        return _chat_completion([{ "role": "user", "content": prompt }], max_tokens=800)
    except Exception:
        return "Resume could not be summarized due to an error."


def generate_questions(
    *,
    num_of_questions: int,
    interview_type: str,
    role: str,
    experience_level: str,
    company_name: str | None,
    company_description: str | None,
    job_description: str | None,
    focus_area: str | None,
    resume_summary: str | None,
) -> List[Dict[str, str]]:
    # Determine question focus based on interview type
    if interview_type == 'technical':
        question_focus = "STRICTLY TECHNICAL questions only. NO behavioral, HR, or soft skills questions. Focus on:"
        technical_areas = [
            "Core programming concepts and algorithms",
            "Data structures and complexity analysis", 
            "System design and architecture",
            "Database design and optimization",
            "API design and integration",
            "Testing methodologies and debugging",
            "Performance optimization",
            "Security best practices"
        ]
        if focus_area:
            technical_areas.insert(0, f"Advanced concepts in {focus_area}")
            technical_areas.insert(1, f"Practical applications of {focus_area}")
        
        behavioral_instruction = "DO NOT include any behavioral questions like 'Tell me about yourself', 'What are your strengths', or 'Describe a challenge'. Only technical questions."
        
    elif interview_type == 'behavioral':
        question_focus = "STRICTLY BEHAVIORAL and HR questions only. NO technical questions. Focus on:"
        technical_areas = [
            "Leadership and teamwork experiences",
            "Problem-solving approaches and decision making",
            "Communication and interpersonal skills",
            "Adaptability and learning agility",
            "Conflict resolution and stress management",
            "Career goals and motivation",
            "Cultural fit and values alignment"
        ]
        behavioral_instruction = "Include classic behavioral prompts like 'Tell me about yourself', 'Describe a time you faced a challenge', 'What are your strengths and weaknesses'."
        
    else:  # mixed
        question_focus = "A BALANCED MIX of technical and behavioral questions. Include both types."
        technical_areas = [
            "Core programming and algorithms",
            "System design and architecture", 
            "Problem-solving approaches",
            "Leadership and teamwork",
            "Communication skills",
            "Technical decision making"
        ]
        if focus_area:
            technical_areas.insert(0, f"Advanced {focus_area} concepts")
        behavioral_instruction = "Include both technical questions and behavioral questions like 'Tell me about yourself', 'Describe a challenge', etc."

    prompt = f"""You are a senior technical interviewer and HR expert specializing in AI-driven interview assessments.

Your task is to generate {num_of_questions} well-crafted, high-quality interview questions for a {experience_level} candidate applying for the role of {role} at {company_name or 'PrepEdge AI'}.

INTERVIEW TYPE: {interview_type.upper()}
{question_focus}

Contextual Information:

Company Description:
{company_description or 'Not provided.'}

Job Description:
{job_description or 'Not provided.'}

Resume Summary (Projects, Education, Skills, Experience):
{resume_summary or 'Not provided.'}

Candidate Focus Areas:
{focus_area or 'None specified.'}

SPECIFIC INSTRUCTIONS:
- {behavioral_instruction}
- Focus heavily on the candidate's focus area: {focus_area or 'general technical skills'}
- Generate questions that align with the resume, job description, and candidate level
- For technical questions, focus on: {', '.join(technical_areas[:4])}
- Make questions progressively challenging based on {experience_level} level
- Keep questions clear, concise, and numbered (e.g., 1., 2., 3.)

For each question, immediately follow it with an ideal response labeled as:

Preferred Answer: followed by a 1–2 sentence ideal answer (based on the resume, job context, and experience level).

Output Format:
Numbered list with each question followed by its preferred answer on a new line.
"""

    try:
        import re
        generated = _chat_completion([{ "role": "user", "content": prompt }], max_tokens=2000)
        questions: List[Dict[str, str]] = []
        lines = generated.split("\n")
        current: Dict[str, str] | None = None
        collecting_answer = False

        number_re = re.compile(r"^\s*(\d+)[\.)]\s+(.*)")

        for raw in lines:
            line = raw.strip()
            if not line:
                continue
            m = number_re.match(line)
            if m:
                if current and (current.get("preferred_answer") or current.get("question")):
                    # Append even if preferred answer missing to avoid empty set
                    if "preferred_answer" not in current:
                        current["preferred_answer"] = ""
                    questions.append(current)
                q_text = m.group(2).strip()
                current = { "question": q_text, "preferred_answer": "" }
                collecting_answer = True
                continue
            if collecting_answer and line.lower().startswith("preferred answer:") and current:
                current["preferred_answer"] = line.split(":", 1)[1].strip()
                collecting_answer = False
                continue
            if collecting_answer and current and current.get("preferred_answer", "") == "":
                # accumulate as answer text if coming right after question
                current["preferred_answer"] = line

            if len(questions) >= num_of_questions:
                break

        if current and current not in questions and current.get("question"):
            questions.append(current)

        # Fallback/padding if model didn't comply
        if len(questions) < num_of_questions:
            remaining = num_of_questions - len(questions)
            base = [
                f"Explain a {role} relevant project you worked on and your impact.",
                f"Describe key concepts in {focus_area or 'your focus area'} you are most confident in.",
                "Share a time you solved a difficult problem and your approach.",
                "How do you handle tight deadlines and prioritize tasks?",
                f"What fundamentals should a {experience_level} {role} master?",
            ]
            for i in range(remaining):
                q = base[i % len(base)]
                questions.append({"question": q, "preferred_answer": ""})

        return questions[:num_of_questions]
    except Exception:
        # Absolute fallback to ensure 200s
        fallback = [
            {"question": f"What makes you a good fit for the {role} role?", "preferred_answer": ""},
            {"question": "Describe a challenging problem you solved and how.", "preferred_answer": ""},
            {"question": f"What are core {focus_area or 'role-specific'} skills for this position?", "preferred_answer": ""},
        ]
        return fallback[:num_of_questions]


def analyze_answer(
    *,
    question: str,
    user_answer: str,
    preferred_answer: str,
    role: str | None,
    experience_level: str | None,
    interview_type: str | None,
) -> Dict[str, Any]:
    # Check if answer is too short or poor quality
    answer_length = len(user_answer.strip())
    if answer_length < 10:
        return {
            "score": 0,
            "feedback": f"BRUTALLY HONEST: This answer is completely unacceptable. You provided only {answer_length} characters when a proper response requires at least 50-100 words. This demonstrates extremely poor communication skills and lack of preparation. For a {role or 'professional'} role, this level of response is embarrassing and shows you are not ready for any serious position. You need to completely rethink your approach to interviews and develop basic communication skills before applying anywhere."
        }
    
    if answer_length < 50:
        return {
            "score": 15,
            "feedback": f"BRUTALLY HONEST: This answer is severely lacking. Only {answer_length} characters shows minimal effort and poor communication skills. You're essentially saying you don't care enough to provide a proper response. For a {role or 'professional'} role, this demonstrates immaturity and lack of professionalism. You need to understand that interviews require detailed, thoughtful responses, not one-liners. This performance suggests you're not ready for professional work."
        }

    prompt = f"""You are a brutally honest technical and HR interviewer who gives direct, unfiltered feedback. Your job is to be completely honest about performance, even if it hurts.

Analyze the user's answer "{user_answer}" in response to the question "{question}", comparing it to the ideal preferred answer "{preferred_answer}". Consider the following context:
- Role: {role or 'Not specified'}
- Experience Level: {experience_level or 'Not specified'}
- Interview Type: {interview_type or 'Not specified'}

IMPORTANT: Be brutally honest. If the answer is poor, say it's poor. If they lack skills, say they lack skills. If they're not ready for the role, say they're not ready. Don't sugarcoat anything.

Provide evaluation in this exact format:
- Score: A numerical score out of 100 (be harsh - 50-70 for mediocre, 30-50 for poor, 0-30 for terrible)
- Feedback: Brutally honest, direct feedback. If they performed poorly, tell them exactly why and what it means for their career prospects. Be specific about what they did wrong and how it reflects on their abilities.

Remember: Your job is to give them the harsh truth they need to hear, not to make them feel good about poor performance."""

    try:
        generated = _chat_completion([{ "role": "user", "content": prompt }], max_tokens=300)
        lines = [ln.strip() for ln in generated.split("\n")]
        score = 0
        feedback = "Analysis failed to provide feedback"
        
        # More flexible parsing for different response formats
        for ln in lines:
            # Try different score patterns
            if any(ln.lower().startswith(pattern) for pattern in ["- score:", "score:", "score is:", "rating:"]):
                try:
                    # Extract number from various formats
                    import re
                    numbers = re.findall(r'\d+', ln)
                    if numbers:
                        score = int(numbers[0])
                except Exception:
                    score = 50  # Default to mediocre if parsing fails
            
            # Try different feedback patterns
            if any(ln.lower().startswith(pattern) for pattern in ["- feedback:", "feedback:", "analysis:", "comment:", "review:"]):
                feedback = ln.split(":", 1)[1].strip() if ":" in ln else ln.strip()
                if feedback:
                    break
        
        # If no feedback found in structured format, use the entire response
        if feedback == "Analysis failed to provide feedback" and generated.strip():
            feedback = generated.strip()
        
        # Validate and adjust score
        if score < 0 or score > 100:
            # Generate score based on answer length and content quality
            if answer_length < 30:
                score = 10
            elif answer_length < 100:
                score = 30
            elif answer_length < 200:
                score = 50
            else:
                score = 70
        
        # If still no feedback, generate based on score
        if feedback == "Analysis failed to provide feedback":
            if score >= 70:
                feedback = f"BRUTALLY HONEST: This answer shows some competence with {answer_length} characters, but still needs significant improvement in depth and technical accuracy for a {role or 'professional'} role."
            elif score >= 50:
                feedback = f"BRUTALLY HONEST: This answer is mediocre at best. With {answer_length} characters, you've shown basic understanding but lack the depth and precision expected for a {role or 'professional'} position. You need to be more specific and demonstrate actual expertise."
            elif score >= 30:
                feedback = f"BRUTALLY HONEST: This answer is poor and shows you're not ready for a {role or 'professional'} role. Only {answer_length} characters demonstrates lack of preparation and poor communication skills. You need to completely rethink your approach."
            else:
                feedback = f"BRUTALLY HONEST: This answer is completely unacceptable. With only {answer_length} characters, you've demonstrated zero professional competence and appear completely unprepared for any serious role. This level of performance is embarrassing."
        
        return { "score": score, "feedback": feedback }
    except Exception as e:
        # Enhanced fallback feedback based on answer characteristics
        if answer_length < 30:
            return {
                "score": 5,
                "feedback": f"BRUTALLY HONEST: This answer is so poor it's almost comical. With only {answer_length} characters, you've demonstrated zero professional communication skills and appear completely unprepared for any serious role. This level of performance suggests you need to completely restart your career preparation from scratch."
            }
        elif answer_length < 100:
            return {
                "score": 20,
                "feedback": f"BRUTALLY HONEST: This answer is severely lacking. Only {answer_length} characters shows minimal effort and poor communication skills. For a {role or 'professional'} role, this demonstrates immaturity and lack of professionalism. You need to understand that interviews require detailed, thoughtful responses."
            }
        else:
            return {
                "score": 40,
                "feedback": f"BRUTALLY HONEST: While you provided {answer_length} characters, the analysis system failed to process your response properly. This suggests either technical issues or that your answer was unclear/confusing. For a {role or 'professional'} role, you need to communicate more clearly and concisely."
            }


def interview_summary(combined_feedback: str | None) -> str:
    feedback_text = (combined_feedback or "").strip() or "No feedback provided."
    prompt = f"""
I have a combined text containing raw feedback for my interview question and answers. I want you to analyze it and generate the following structured outputs:

- Overall Summary: A concise, reflective summary of how the interview went overall and what key takeaways I should carry forward.
- Strengths: Provide up to 3 strengths, each with a short title and a description of 2–3 lines that highlights the positive aspects of my performance.
- Areas of Improvement: Provide up to 3 improvement areas, each with a title and a 2–3 line explanation, focusing on what I can do better in future interviews.

Make sure the tone is constructive and personalized, like it's talking directly to me.

Here is the raw feedback input:
{feedback_text}
"""
    try:
        generated = _chat_completion([{ "role": "user", "content": prompt }], max_tokens=500)
        return generated.strip()
    except Exception:
        return "Interview summary could not be generated due to an error."




